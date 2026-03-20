# API 스펙

작성시각: 2026-03-20 18:10 KST

## 공통

- 익명/로그인 공존 시 `ant_gravity_user_id` 쿠키를 사용한다.
- 시간 기준은 UTC다.
- 정산 가격 소스는 Bybit USDT perpetual 종가 기준이다.

## `GET /api/auth/session`

현재 세션과 guest user id를 조회한다.

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
  guestUserId: string | null;
}
```

프론트 규칙:

- 주요 화면의 헤더는 서버에서 만든 `initialCurrentUserSnapshot`으로 첫 렌더를 한다.
- 이 API는 초기 hydrate 이후의 재검증 경로와 `refreshCurrentUserStore()` 이후 동기화 경로로 사용한다.

## `POST /api/auth/signout`

현재 Supabase 세션을 종료한다.

```ts
{
  ok: true;
}
```

## `POST /api/auth/merge-local`

브라우저의 익명 local 상태를 계정 DB로 병합한다.

요청:

```ts
{
  localUserLevel?: UserLevel | null;
  recentCoins?: string[] | null;
  userBattle?: UserBattle | null;
  battleSnapshot?: BattleSnapshotStorage | null;
}
```

응답:

```ts
{
  ok: true;
  importedBattleIds: string[];
}
```

## `GET /api/coins/search?q=...`

CoinGecko 검색 결과를 반환한다.

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

## `GET /api/coins/top`

홈 화면 Top 코인 목록을 반환한다.

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

## `POST /api/battle`

토론 시작 API. 시장 데이터와 8명의 토론 메시지를 SSE로 보낸다.

요청:

```ts
{
  coinId: string;
}
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

event: battle_complete
data: { count, completed }

event: error
data: { code, message, retryable }
```

추가 규칙:

- 서버는 `getBattleMarketSnapshot()`과 `getReusableDebateContext()`를 병렬 시작한다.
- `battle_start`는 시장 데이터 준비 직후 먼저 전송한다.
- 클라이언트는 `battle_complete` 직후 snapshot을 서버에도 저장한다.
- 일부 캐릭터 LLM 실패는 fallback 메시지로 복구하고 스트림은 계속 진행한다.

## `POST /api/battle/snapshot`

배틀 토론 snapshot 서버 저장 API.

요청:

```ts
{
  snapshotId: string;
  battleId?: string | null;
  coinId: string;
  marketData: MarketData | null;
  summary: BattleSummary | null;
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

- 서버가 현재 세션 userId를 snapshot owner로 기록한다.
- 같은 `snapshotId`라도 다른 userId가 덮어쓸 수 없다.
- pick 단계에서 `battleId`를 다시 보내 snapshot과 battle을 연결한다.

## `GET /api/battle/snapshot?snapshotId=...`

현재 세션 userId와 일치한 snapshot만 조회한다.

```ts
{
  ok: true;
  snapshot: BattleSnapshotRecord;
}
```

## `GET /api/battle/snapshot?battleId=...`

배틀 ID로 연결된 snapshotId를 조회한다.

```ts
{
  ok: true;
  snapshotId: string;
  battleId: string | null;
  coinId: string;
  ownerMatched: boolean;
}
```

## `POST /api/battle/outcome`

선정 이후 결과 계산 API.

요청:

```ts
{
  userBattle: UserBattle;
  messages?: DebateMessage[];
}
```

동작:

1. `snapshotId`가 있으면 서버 snapshot을 userId 기준으로 조회한다.
2. body.messages가 없으면 snapshot.messages를 사용한다.
3. `fetchBattleSettlement`로 Bybit 캔들 정산 상태를 조회한다.
4. `pending`이면 `409 settlement_pending`을 반환한다.
5. `settled`이면 outcome, memory seed, player decision seed, report, memo를 저장한다.
6. 같은 `battleId` 결과가 이미 있으면 recovered 응답을 준다.

정산 규칙:

- 진입 가격: 선택 시점 직후 가장 가까운 1분봉 종가
- 정산 가격: `settlementAt`가 포함된 타임프레임 캔들 종가
- 거래소: Bybit linear
- 시간대: UTC

성공 응답:

```ts
{
  ok: true;
  battleOutcomeSeed: BattleOutcomeSeed;
  characterMemorySeeds: CharacterMemorySeed[];
  playerDecisionSeed: PlayerDecisionSeed;
  report: BattleReport;
  reportSource: "gemini" | "fallback";
  recovered?: true;
}
```

대기 응답:

```ts
{
  error: "settlement_pending";
  settlementAt: string;
  priceSource: "bybit-linear";
  marketSymbol: string;
}
```

## `GET /api/battle/outcome?battleId=...`

저장된 결과를 battleId 기준으로 조회한다.

## `GET /api/battle/events?battleId=...`

이벤트 로그를 조회한다.

## `GET /api/battle/applications?battleId=...`

해당 배틀 결과가 현재 세션에 이미 적용되었는지 조회한다.

## `POST /api/battle/applications`

해당 배틀 결과를 현재 세션에 적용했다고 기록한다.

## `GET /api/characters`

캐릭터 목록을 반환한다.

규칙:

- `CHARACTERS_SOURCE=external`이면 외부 소스를 시도한다.
- 외부 호출 실패 시 로컬 카탈로그 fallback을 사용한다.
- 응답 헤더:

```text
x-characters-source: "external" | "local"
x-characters-fallback: "true" | "false"
```

프론트 규칙:

- 현재 `/characters` 페이지는 이 API를 마운트 후 다시 호출하지 않는다.
- 서버에서 소스 상태 문구를 계산할 때만 동일한 저장소 선택 로직을 사용한다.

## `GET /api/me`

로그인 사용자 프로필과 진행도를 반환한다.

## `GET /api/me/progress`

로그인 사용자 레벨/XP를 반환한다.

## `GET /api/me/battles`

로그인 사용자 배틀 목록을 반환한다.

## `GET /api/me/battles/[battleId]`

로그인 사용자 배틀 상세를 반환한다.

## 외부 소스

- CoinGecko: 가격 검색, 시장 개요
- Alternative.me: Fear & Greed
- Alpha Vantage, GDELT, NewsAPI: 뉴스 감성
- Bybit: account ratio, 실캔들 정산
- Hyperliquid: open interest, funding rate, whale score
- OpenRouter: 토론 생성
- Gemini: 리포트 합성
