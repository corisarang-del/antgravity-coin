# API 스펙

- 작성시각: 2026-03-21 03:01 KST
- 기준: 현재 `src/app/api/*` 구현

## 공통 규칙

- 시간은 UTC ISO 문자열 기준
- 정산 가격 소스는 `bybit-linear`
- owner 계산은 `auth user id -> guest cookie id`
- battle outcome 저장은 `battleId` 단위 직렬화

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

응답 헤더:

```text
x-battle-prepared-context-hit
x-battle-prepared-first-turn-hit
x-battle-prepared-at-age-ms
```

구현 메모:

- 4라운드 병렬 구조
- `Aira`, `Ledger` prepared first turn 재사용 가능
- `battle_pick_ready`는 bull 2개, bear 2개 메시지가 모이면 송신
- 일부 캐릭터가 fallback을 써도 전체 스트림은 계속 진행

### `GET /api/battle/snapshot?snapshotId=...`

현재 owner가 소유한 snapshot 조회.

### `GET /api/battle/snapshot?battleId=...`

battleId로 연결된 snapshotId를 조회한다.

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

### `GET /api/battle/events?battleId=...`

event log 조회.

```ts
{ ok: true, events: EventLogEntry[] }
```

### `GET /api/battle/applications?battleId=...`

현재 owner 기준 결과 적용 여부 확인.

```ts
{ applied: boolean, userId: string }
```

### `POST /api/battle/applications`

현재 owner에 결과 적용 완료 기록.

```ts
{
  ok: true;
  userId: string;
}
```

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

### `GET /api/admin/battles`

recent outcome 목록 반환.

### `GET /api/admin/battles?battleId=...`

battleId로 outcome/report/seed 직접 조회 가능.

### `GET /api/admin/battles/[battleId]`

특정 battle의 outcome, player decision, character memory, report, events 조회.
