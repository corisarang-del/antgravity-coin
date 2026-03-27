# API 스펙

- 작성시각: 2026-03-21 03:01 KST
- 기준: 현재 `src/app/api/*` 구현

## 공통 규칙

- 시간은 UTC ISO 문자열 기준
- 정산 가격 소스는 `bybit-linear`
- owner 계산은 `auth user id -> guest cookie id`
- battle outcome 저장은 `battleId` 단위 직렬화
- `battleId` 조회 API는 현재 owner가 가진 snapshot 기준으로만 접근 가능
- 일부 공개/고비용 route는 shared rate limit과 일일 quota를 건다

## 인증

### `GET /api/auth/session`

현재 세션과 guest user id를 반환한다.

```ts
{
  user: {
    userId: string;
    email: string;
    name: string;
    image: string;
    providerHints: string[];
  } | null;
  isAuthenticated: boolean;
  guestUserId: string;
}
```

### `POST /api/auth/signout`

Supabase 세션을 종료한다.

```ts
{ ok: true }
```

회귀 테스트:

- `src/app/api/auth/signout/route.test.ts`

### `POST /api/auth/merge-local`

게스트 local 상태와 guest owner 기반 battle 자산을 로그인 계정으로 병합한다.

요청:

```ts
{
  localUserLevel?: UserProgress | null;
  recentCoins?: string[] | null;
  userBattle?: UserBattle | null;
  battleSnapshot?: {
    snapshotId?: string | null;
    coinId: string;
    marketData: MarketData | null;
    summary: BattleSnapshotRecord["summary"];
    messages: DebateMessage[];
    savedAt?: string;
  } | null;
}
```

응답:

```ts
{
  ok: true;
  importedBattleIds: string[];
}
```

## 코인

### `GET /api/coins/search?q=...`

CoinGecko 검색 결과 반환.

규칙:

- 빈 검색어는 즉시 `[]` 반환
- 검색어 길이 64자 초과 시 `400 invalid_query`
- public + client ip 기준 분당 30회 shared rate limit
- 초과 시 `429 rate_limit_exceeded`, limiter 사용 불가 시 `503 rate_limit_unavailable`

### `GET /api/coins/top`

홈 Top 코인 반환.

## battle

### `POST /api/battle`

시장 데이터와 토론 메시지를 SSE로 스트리밍한다.

요청:

```ts
{ coinId: string }
```

이벤트:

```text
event: battle_start
data: { marketData, summary }

event: character_start
data: { characterId, characterName, team }

event: message
data: DebateMessage

event: character_done
data: { characterId, provider, model, fallbackUsed }

event: battle_pick_ready
data: { bullCount, bearCount, ready }

event: battle_complete
data: { count, completed }

event: error
data: { code, message, retryable }
```

추가 메모:

- 첫 SSE 청크는 placeholder `battle_start`로 먼저 열리고, 실제 `marketData`, `summary`가 준비되면 같은 이벤트로 다시 갱신한다.
- opening round draft는 더 이상 pre-response 단계에서 만들지 않는다.

응답 헤더:

```text
x-battle-prepared-context-hit
x-battle-prepared-first-turn-hit
x-battle-prepared-at-age-ms
```

rate limit:

- owner + client ip 기준 분당 5회
- owner + client ip 기준 일일 60회
- 초과 시 `429 rate_limit_exceeded`, `Retry-After` 헤더 반환

구현 메모:

- 4라운드 병렬 구조
- 외부 데이터 timeout
  - CoinGecko: 4초
  - Fear & Greed: 3초
  - Alpha Vantage / GDELT / NewsAPI: 각 4초
  - Hyperliquid: 4초
- 캐릭터 메시지는 상위 레벨에서 15초 timeout 뒤 fallback으로 내려간다
- `battle_pick_ready`는 bull 2개, bear 2개 메시지가 모이면 송신
- 일부 캐릭터가 fallback을 써도 전체 스트림은 계속 진행

production 검증 메모:

- 2026-03-27 기준 `antgravity-coin.vercel.app`
  - `BTC` 배틀 진입 성공
  - `8/8` 발언 완료 확인
  - `pick -> waiting -> result` 진입 확인

### `GET /api/battle/snapshot?snapshotId=...`

현재 owner가 소유한 snapshot 조회.

### `GET /api/battle/snapshot?battleId=...`

battleId로 연결된 snapshotId를 조회한다.
단, 현재 owner가 소유한 snapshot일 때만 조회된다.

```ts
{
  ok: true;
  snapshotId: string;
  battleId: string | null;
  coinId: string;
  ownerMatched: boolean;
}
```

### `POST /api/battle/snapshot`

snapshot 저장 또는 `battleId` 연결.

요청:

```ts
{
  snapshotId: string;
  battleId?: string | null;
  coinId: string;
  marketData: MarketData | null;
  summary: BattleSnapshotRecord["summary"];
  messages: DebateMessage[];
  savedAt?: string;
}
```

응답:

```ts
{
  ok: true;
  snapshotId: string;
  userId: string;
  battleId: string | null;
  savedAt: string;
}
```

규칙:

- 기존 snapshot이 다른 owner 소유면 `403 snapshot_owner_mismatch`
- 로그인 사용자면 Supabase `battle_snapshots`도 upsert

### `POST /api/battle/session`

선택 직후 로그인 사용자 `battle_sessions` 저장.

요청:

```ts
{ userBattle: UserBattle }
```

비로그인 응답:

```ts
{ ok: false, skipped: "unauthenticated" }
```

메모:

- 내부 persistence는 `snapshotId`가 없으면 저장 의미가 없다.

### `GET /api/battle/outcome?battleId=...`

battleId 기준 기존 outcome, report, seeds 조회.
단, 현재 owner가 가진 battle snapshot이 있을 때만 조회된다.

### `POST /api/battle/outcome`

결과 계산과 영속화.

요청:

```ts
{
  userBattle: UserBattle;
  messages?: DebateMessage[];
}
```

주요 동작:

1. `battleId`별 직렬화
2. 기존 outcome/report/seed가 있으면 recovered 응답
3. `snapshotId`가 있으면 owner 기준 snapshot 조회
4. snapshot battle mismatch면 `409`
5. settlement pending이면 `409 settlement_pending`
6. settled면 outcome/report/memo/seed/event/application 저장
7. 로그인 사용자면 Supabase battle 자산 미러 저장

rate limit:

- owner + client ip 기준 분당 10회
- owner + client ip 기준 일일 120회
- 초과 시 `429 rate_limit_exceeded`, `Retry-After` 헤더 반환

### `GET /api/battle/events?battleId=...`

event log 조회.
단, 현재 owner가 가진 battle snapshot이 있을 때만 조회된다.

```ts
{ ok: true, events: EventLogEntry[] }
```

rate limit:

- owner + client ip 기준 분당 60회
- 초과 시 `429 rate_limit_exceeded`, limiter 사용 불가 시 `503 rate_limit_unavailable`

### `GET /api/battle/applications?battleId=...`

현재 owner 기준 결과 적용 여부 확인.

```ts
{ applied: boolean, userId: string }
```

rate limit:

- owner + client ip 기준 분당 60회

### `POST /api/battle/applications`

현재 owner에 결과 적용 완료 기록.

```ts
{
  ok: true;
  userId: string;
}
```

rate limit:

- owner + client ip 기준 분당 20회
- owner + client ip 기준 일일 240회

## 캐릭터

### `GET /api/characters`

캐릭터 목록 반환.

응답 헤더:

```text
x-characters-source
x-characters-fallback
```

## 내 정보

### `GET /api/me`

프로필과 진행도 반환.

### `GET /api/me/progress`

레벨/XP 반환.

### `GET /api/me/battles`

로그인 사용자 battle 목록 반환.

### `GET /api/me/battles/[battleId]`

로그인 사용자 battle 상세 반환.

## 운영

### `GET /api/providers/routes`

현재 runtime route 목록 반환.

### `POST /api/providers/routes`

평가 결과를 받아 runtime route override 갱신.

요청:

```ts
{
  evaluations?: Array<{
    characterId: string;
    candidateRoute: CharacterModelRoute;
    failureRate: number;
    averageLatencyMs: number;
    shadowMatched: boolean;
  }>;
}
```

### `POST /api/admin/cache/prewarm`

prepared battle context 예열.

요청:

```ts
{ coinIds?: string[] }
```

응답:

```ts
{
  ok: true;
  coinIds: string[];
  results: Array<{
    coinId: string;
    ok: boolean;
    prepared: boolean;
    cacheHit: boolean;
    preparedAtAgeMs?: number | null;
    refreshQueued: boolean;
    durationMs: number;
    error?: string;
  }>;
}
```

rate limit:

- owner + client ip 기준 분당 2회
- 초과 시 `429 rate_limit_exceeded`, `Retry-After` 헤더 반환

### `GET /api/admin/battles`

recent outcome 목록 반환.

### `GET /api/admin/battles?battleId=...`

battleId로 outcome/report/seed 직접 조회 가능.

### `GET /api/admin/battles/[battleId]`

특정 battle의 outcome, player decision, character memory, report, events 조회.
