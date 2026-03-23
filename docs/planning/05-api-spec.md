# API 스펙

- 작성시각: 2026-03-21 18:27 KST
- 기준: 현재 `src/app/api/*` 구현

## 공통 규칙

- 시간은 UTC ISO 문자열 기준
- 결과 정산 가격 소스는 `bybit-linear`
- owner 계산은 `auth user id -> guest cookie id`
- 결과 계산은 `battleId` 단위 직렬화
- `battleId` 조회 API 중 일부는 owner snapshot이 있을 때만 허용
- 일부 고비용 POST route는 in-memory rate limit 적용

## 인증

### `GET /api/auth/session`

현재 세션과 guest user id 반환.

### `POST /api/auth/signout`

Supabase 세션 종료.

### `POST /api/auth/merge-local`

guest local 상태와 guest owner battle 자산을 로그인 계정으로 병합.

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

홈 Top 코인 목록 반환.

## battle

### `POST /api/battle`

시장 데이터와 토론 메시지를 SSE로 스트리밍.

요청:

```ts
{ coinId: string }
```

이벤트:

```text
battle_start
character_start
message
character_done
battle_pick_ready
battle_complete
error
```

응답 헤더:

- `x-battle-prepared-context-hit`
- `x-battle-prepared-first-turn-hit`
- `x-battle-prepared-at-age-ms`

rate limit:

- owner + client ip 기준 분당 5회
- 초과 시 `429 rate_limit_exceeded`, `Retry-After`

구현 메모:

- 4라운드 병렬 구조
- `Aira`, `Ledger` prepared first turn 재사용 가능
- bull 2개, bear 2개 메시지가 모이면 `battle_pick_ready` 송신

### `GET /api/battle/snapshot?snapshotId=...`

현재 owner가 가진 snapshot 전체 조회.

### `GET /api/battle/snapshot?battleId=...`

현재 owner가 가진 battle snapshot 존재 여부와 `snapshotId` 조회.

### `POST /api/battle/snapshot`

snapshot 저장 또는 `battleId` 연결.

규칙:

- 기존 snapshot이 다른 owner 소유면 `403 snapshot_owner_mismatch`
- 로그인 사용자면 Supabase `battle_snapshots`도 upsert

### `POST /api/battle/session`

선택 직후 로그인 사용자 `battle_sessions` 저장.

비로그인 응답:

```ts
{ ok: false, skipped: "unauthenticated" }
```

### `GET /api/battle/outcome?battleId=...`

현재 owner가 가진 battle snapshot이 있을 때 기존 outcome, report, seeds 반환.

### `POST /api/battle/outcome`

결과 계산과 영속화.

요청:

```ts
{
  userBattle: UserBattle;
  messages?: DebateMessage[];
  mode?: "settlement" | "full";
}
```

주요 분기:

1. `battleId`별 직렬화
2. 기존 결과가 있으면 recovered 응답
3. settlement 전이면 `409 settlement_pending`
4. `mode: "settlement"`면 report 없이 seed 우선 반환
5. `mode: "full"`이면 report와 memo까지 생성

rate limit:

- owner + client ip 기준 분당 10회
- 초과 시 `429 rate_limit_exceeded`, `Retry-After`

### `GET /api/battle/events?battleId=...`

owner snapshot이 있을 때 event log 조회.

### `GET /api/battle/applications?battleId=...`

현재 owner 기준 결과 적용 여부 확인.

### `POST /api/battle/applications`

현재 owner에 결과 적용 완료 기록.

## 캐릭터

### `GET /api/characters`

캐릭터 목록 반환.

응답 헤더:

- `x-characters-source`
- `x-characters-fallback`

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

### `POST /api/admin/cache/prewarm`

prepared battle context 예열.

응답 결과 항목:

- `coinId`
- `ok`
- `symbol`
- `prepared`
- `cacheHit`
- `preparedAtAgeMs`
- `refreshQueued`
- `durationMs`
- `error`

rate limit:

- owner + client ip 기준 분당 2회
- 초과 시 `429 rate_limit_exceeded`, `Retry-After`

### `GET /api/admin/battles`

- `battleId` 없으면 recent outcome 목록 반환
- `battleId` 있으면 outcome, seeds, report 직접 반환

### `GET /api/admin/battles/[battleId]`

특정 battle의 outcome, player decision, character memory, report, events 조회.

메모:

- 현재 `/admin/*` 자체 접근 제어는 아직 없다.
