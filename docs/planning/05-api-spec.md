# API 명세

## 아키텍처 개요

```text
클라이언트
  -> Next.js Route Handler
  -> 외부 API 또는 fallback 데이터 수집
  -> 배틀 메시지 생성
  -> SSE 또는 JSON 응답
```

---

## OpenRouter 하나로 시작하는 방법

OpenRouter 공식 문서 기준으로는 단일 API 키와 단일 엔드포인트로 여러 모델을 바로 호출할 수 있다.

### 기본 원칙
- 인증은 `Authorization: Bearer <OPENROUTER_API_KEY>`
- 기본 엔드포인트는 `https://openrouter.ai/api/v1/chat/completions`
- 모델명은 반드시 provider prefix를 포함한다
  - 예: `qwen/qwen3.5-9b`
  - 예: `minimax/minimax-m2.5:free`
  - 예: `nvidia/nemotron-3-super-120b-a12b:free`
  - 예: `stepfun/step-3.5-flash:free`
- 선택 헤더:
  - `HTTP-Referer`
  - `X-OpenRouter-Title`

### 이 프로젝트에서의 권장 시작 방식
- 개발 초기는 provider별 키를 모두 모으기보다 `OPENROUTER_API_KEY` 하나로 먼저 검증한다.
- 캐릭터별 모델 배정은 OpenRouter 모델명 기준으로 라우팅한다.
- 최종 취합 에이전트 `Gemini`는 OpenRouter 경유가 아니라 직결 API로 분리한다.
- 즉시 구현 단계에서는 OpenRouter 단일 키 경로를 기준으로 문서와 코드를 맞춘다.
- provider별 개별 env 구조는 직결 API 전환 시점까지 후순위로 둔다.

### OpenRouter 시작 시 장점
- 키 하나로 여러 provider 모델을 바로 비교 가능하다.
- 모델 교체 속도가 빠르다.
- provider별 장애나 요금제 탐색 전, 배정표 검증을 빨리 할 수 있다.

### OpenRouter 시작 시 주의점
- provider 원본 API의 세부 파라미터와 완전히 같지 않을 수 있다.
- 최종 운영 전에는 원본 provider 직결과 응답 차이를 다시 검증해야 한다.

---

## 내부 API

### `GET /api/auth/session`

익명 사용자 세션을 조회하거나 없으면 생성한다.

**Response**

```ts
{
  userId: string;
}
```

### `GET /api/coins/search?q=...`

CoinGecko 검색 결과를 반환한다. 실패 시 fallback 목록으로 대체한다.

**Response**

```ts
{
  coins: Array<{
    id: string;
    symbol: string;
    name: string;
    thumb: string;
  }>;
}
```

### `GET /api/coins/top`

홈 화면용 Top 코인을 반환한다.

**Response**

```ts
{
  coins: Array<{
    id: string;
    symbol: string;
    name: string;
    price: string;
    change24h: number;
    marketCap: string;
    thesis: string;
    thumb: string;
  }>;
}
```

### `POST /api/battle`

배틀 시장 스냅샷과 캐릭터 토론을 SSE로 반환한다.

**Request**

```ts
{
  coinId: string;
}
```

**SSE Events**

```text
event: battle_start
data: { marketData, summary }

event: character_start
data: { characterId, characterName, team }

event: message
data: DebateMessage

event: character_done
data: { characterId }

event: battle_complete
data: { count, completed }

event: error
data: { code, message, retryable }
```

메모:
- 현재 구현은 `error` 이벤트를 포함한다.
- `battle_start` 이후 8개 메시지를 순차 송신한 뒤 `battle_complete`로 종료한다.

### 실패 모드와 복구 정책

- 요청 body에 `coinId`가 없으면 `400`과 JSON `{ error: "missing_coin_id", retryable: false }`를 반환한다.
- 배틀 시작 전 스냅샷 자체를 만들 수 없으면 `502`와 JSON `{ error: "battle_snapshot_unavailable", retryable: true }`를 반환한다.
- 외부 시장 데이터 일부만 실패하면 배틀 전체를 중단하지 않고 fallback 필드로 계속 진행한다.
- SSE 스트림 시작 후 치명적 오류가 나면 `event: error`를 한 번 송신하고 스트림을 종료한다.
- 중간 실패가 나더라도 이미 송신된 메시지는 클라이언트에서 유지한다.

### `GET /api/battle/applications?battleId=...`

해당 배틀 결과가 현재 사용자에게 이미 반영됐는지 조회한다.

**Response**

```ts
{
  applied: boolean;
  userId: string;
}
```

### `POST /api/battle/applications`

해당 배틀 결과를 현재 사용자에게 반영했다고 기록한다.

**Request**

```ts
{
  battleId: string;
}
```

**Response**

```ts
{
  ok: true;
  userId: string;
}
```

### `GET /api/characters`

캐릭터 목록을 반환한다. `CHARACTERS_SOURCE`가 `external`이면 외부 API를 사용하고, 아니면 로컬 카탈로그를 사용한다.

**Response**

```ts
{
  characters: Array<{
    id: string;
    name: string;
    role: string;
    team: "bull" | "bear";
    specialty: string;
    emoji: string;
    imageSrc: string;
    posterSrc: string;
    imageFileName: string;
    sourceImageName: string;
    personality: string;
    selectionReason: string;
    accentTone: "rose" | "cream" | "butter";
  }>;
}
```

### 응답 계약 확정

- 정식 계약은 `{ characters: [...] }` shape로 고정한다.
- `local`, `external` 모두 같은 응답 shape를 강제한다.
- `external` 소스가 실패하면 API 레이어에서 로컬 캐릭터 카탈로그로 fallback한다.
- fallback이 발생한 경우에도 shape는 바꾸지 않는다.

---

## 외부 API 의존성

| API | 용도 | 현재 상태 |
|-----|------|----------|
| CoinGecko | 검색, Top 코인, 가격 기반 데이터 | 검색/Top 코인 사용 |
| Alternative.me | 공포탐욕지수 | 사용 |
| Alpha Vantage NEWS_SENTIMENT | 뉴스 감성 1순위 | 사용 |
| GDELT DOC 2.0 | 뉴스 감성 2순위 | 사용 |
| NewsAPI Everything | 뉴스 감성 3순위 | 사용 |
| Bybit | 롱숏 비율 | 사용 |
| Hyperliquid | 미결제약정, 펀딩비, 고래 점수 계산용 원데이터 | 사용 |
| OpenRouter | 캐릭터 모델 호출 시작점 | 기본 캐릭터 호출 경로 |
| Gemini | 최종 결과 취합 | 직결 API 사용 |
| Qwen | 기본 캐릭터 모델 / 공통 fallback | OpenRouter 모델명으로 호출 |
| MiniMax | 기본 캐릭터 모델 | OpenRouter 모델명으로 호출 |
| NVIDIA Nemotron | 기본 캐릭터 모델 | OpenRouter 모델명으로 호출 |
| StepFun | 기본 캐릭터 모델 | OpenRouter 모델명으로 호출 |

---

## 에러와 fallback 원칙

- CoinGecko 실패 시 mock Top 코인 또는 fallback 검색 결과 사용
- 개별 캐릭터 모델 실패 시 `Qwen: Qwen3.5-9B` 공통 fallback을 먼저 시도한다.
- `Qwen` fallback도 실패하면 캐릭터별 fallback 메시지를 생성한다.
- 세션이나 battleId가 없으면 `400` 반환
- 결과 반영 기록은 이미 있으면 중복 저장하지 않음
- 배틀용 `fetchMarketData`는 실데이터 확보에 실패하면 오류를 반환하고, 가짜 근거값으로 배틀을 계속하지 않는다

---

## 멀티 Provider 배정표

| 캐릭터 | 팀 | 기본 provider | 기본 model | 공통 fallback |
|------|----|---------------|------------|---------------|
| Aira | bull | `qwen` | `Qwen3.5-9B` | `Qwen3.5-9B` |
| Judy | bull | `minimax` | `MiniMax M2.5 (free)` | `Qwen3.5-9B` |
| Clover | bull | `nvidia` | `Nemotron 3 Super (free)` | `Qwen3.5-9B` |
| Blaze | bull | `stepfun` | `Step 3.5 Flash (free)` | `Qwen3.5-9B` |
| Ledger | bear | `nvidia` | `Nemotron 3 Super (free)` | `Qwen3.5-9B` |
| Shade | bear | `stepfun` | `Step 3.5 Flash (free)` | `Qwen3.5-9B` |
| Vela | bear | `minimax` | `MiniMax M2.5 (free)` | `Qwen3.5-9B` |
| Flip | bear | `qwen` | `Qwen3.5-9B` | `Qwen3.5-9B` |

메모:
- 팀 안의 4명은 서로 다른 기본 모델을 쓴다.
- 최종 결과 취합은 캐릭터 라우팅과 분리해서 `Gemini`를 사용한다.
- 공통 fallback은 `Qwen: Qwen3.5-9B`로 통일한다.

---

## 호출 정책 수치

### OpenRouter 캐릭터 모델
- timeout:
  - cheap: `10_000ms`
  - balanced: `12_000ms`
  - premium: `15_000ms`
- retry:
  - 1회
  - backoff: `800ms`
- rate limit:
  - 앱 전체 기본 상한 `60 req/min`
  - 동일 battle 내 동시 호출 상한 `2`

### Gemini 최종 취합
- timeout: `15_000ms`
- retry: 1회
- backoff: `1_000ms`
- rate limit:
  - `20 req/min`
  - 동일 battle 당 최종 취합 1회

### 시장 데이터 API
- CoinGecko: timeout `4_000ms`, retry 1회
- Alternative.me: timeout `3_000ms`, retry 1회
- Alpha Vantage: timeout `3_000ms`, retry 1회
- GDELT: timeout `3_000ms`, retry 1회
- NewsAPI: timeout `3_000ms`, retry 1회
- Bybit: timeout `3_000ms`, retry 1회
- Hyperliquid: timeout `3_000ms`, retry 1회

메모:
- 현재 v1 `MarketData`에는 `marketCap`, `marketCapRank`가 없다.
- `openInterest`, `fundingRate`는 Hyperliquid 실호출 필드로 포함한다.

### 역할별 대체 evidence 규칙
- Ledger:
  - `volume24h`
  - `priceChange24h`
  - `priceChange7d`
- Shade:
  - `longShortRatio`
  - `openInterest`
  - `fundingRate`
  - `priceChange24h`
- Vela:
  - `whaleScore`
  - `volume24h`
  - `openInterest`

---

## 최종 취합 계약

### 입력
- `battleOutcomeSeed`
- `characterMemorySeeds`
- `playerDecisionSeed`
- `MarketData` 요약 필드

### 출력 책임
- 배틀 전체 요약
- 승리 팀 핵심 근거 재정리
- 패배 팀 약점 재정리
- 플레이어 판단 회고

### 출력 책임 밖
- 승패 판정
- XP 계산
- 원본 시장 데이터 계산

---

## 호출 정책 수치

### OpenRouter 캐릭터 모델
- timeout:
  - cheap: `10_000ms`
  - balanced: `12_000ms`
  - premium: `15_000ms`
- retry:
  - 1회
  - backoff: `800ms`
- rate limit:
  - 앱 전체 기본 상한 `60 req/min`
  - 동일 battle 내 동시 호출 상한 `2`

### Gemini 최종 취합
- timeout: `15_000ms`
- retry: 1회
- backoff: `1_000ms`
- rate limit:
  - `20 req/min`
  - 동일 battle 당 최종 취합 1회

### 시장 데이터 API
- CoinGecko: timeout `4_000ms`, retry 1회
- Alternative.me: timeout `3_000ms`, retry 1회
- Alpha Vantage: timeout `3_000ms`, retry 1회
- GDELT: timeout `3_000ms`, retry 1회
- NewsAPI: timeout `3_000ms`, retry 1회
- Bybit: timeout `3_000ms`, retry 1회
- Hyperliquid: timeout `3_000ms`, retry 1회

---

## 최종 취합 계약

### 입력
- `battleOutcomeSeed`
- `characterMemorySeeds`
- `playerDecisionSeed`
- `MarketData` 요약 필드

### 출력 책임
- 배틀 전체 요약
- 승리 팀 핵심 근거 재정리
- 패배 팀 약점 재정리
- 플레이어 판단 회고

### 출력 책임 밖
- 승패 판정
- XP 계산
- 원본 시장 데이터 계산

---

## 구현 전 점검 메모

- OpenRouter 하나로 먼저 시작할 경우:
  - `OPENROUTER_API_KEY`
  - OpenRouter base URL
  - provider prefix 포함 모델명
  이 3가지만 먼저 맞추면 된다.
- 이후 원본 provider 직결로 넘어갈 때는:
  - 응답 shape 차이
  - timeout 정책
  - rate limit
  - tool calling 차이
  를 다시 확인해야 한다.

---

## 현재 API 우선 정비 항목

- `/api/characters` 응답 계약은 문서, 테스트, 구현 사이 정합성 확인이 필요하다.
- 외부 캐릭터 API 실패 시 fallback 정책을 더 명확히 문서화할 필요가 있다.
- `fetchMarketData` 실데이터 의존 경로가 끊길 때 사용자 안내와 재시도 UX를 더 분명히 해야 한다.
- 뉴스 감성은 `Alpha Vantage -> GDELT -> NewsAPI` 순서로 동작한다.

---

## 현재 남은 API 실무 보강 항목

- `GET /api/battle/outcome?battleId=...` 조회 API는 있다.
- `GET /api/battle/events?battleId=...` 조회 API는 있다.
- `GET /api/admin/battles`, `GET /api/admin/battles/[battleId]` 운영자 조회 API는 있다.
- `/api/battle/outcome`은 기본 저장과 recovered 응답은 구현됐지만, 서버 다중 인스턴스 기준 강한 실패 복구 정책은 여전히 부족하다.
- `/api/providers/routes`는 운영 초안 수준이고 실측 메트릭 자동 연동은 아직 없다.
- `GET /api/characters`는 fallback 상태를 헤더로 전달하고, 화면 안내도 기본 구현돼 있다.

---

## fetchMarketData 필드 출처 매트릭스

| 필드 | 우선 출처 | 비고 |
|------|-----------|------|
| `coinId` | CoinGecko | 실호출 |
| `symbol` | CoinGecko | 실호출 |
| `currentPrice` | CoinGecko | 실호출 |
| `priceChange24h` | CoinGecko | 실호출 |
| `priceChange7d` | CoinGecko | 실호출 또는 30일 가격 히스토리 기반 계산 |
| `rsi` | CoinGecko 30일 가격 히스토리 | 실데이터 기반 계산 |
| `macd` | CoinGecko 30일 가격 히스토리 | 실데이터 기반 계산 |
| `bollingerUpper` | CoinGecko 30일 가격 히스토리 | 실데이터 기반 계산 |
| `bollingerLower` | CoinGecko 30일 가격 히스토리 | 실데이터 기반 계산 |
| `fearGreedIndex` | Alternative.me | 실패 시 fallback 필요 |
| `fearGreedLabel` | Alternative.me | 실패 시 fallback 필요 |
| `sentimentScore` | Alpha Vantage -> GDELT -> NewsAPI | 실호출 후 내부 점수화 |
| `longShortRatio` | Bybit | 실호출 |
| `openInterest` | Hyperliquid | 실호출 |
| `fundingRate` | Hyperliquid | 실호출 |
| `whaleScore` | Hyperliquid | 실호출 기반 계산 |
| `volume24h` | CoinGecko | 실호출 |
