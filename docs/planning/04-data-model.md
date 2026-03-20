# 데이터 모델

- 작성시각: 2026-03-21 03:01 KST
- 기준: `src/domain/models/*`, `src/application/useCases/preparedBattleContext.ts`

## 원칙

- GPS 같은 민감 정보는 저장하지 않는다.
- 요청 owner는 `auth user id`를 우선하고, 비로그인이면 guest 쿠키 id를 사용한다.
- 결과 영속화는 `battleId` 기준으로 직렬화해 중복 저장을 막는다.
- snapshot은 `snapshotId` 기준으로 저장하고, 정산 시 `owner + snapshotId + battleId` 정합성을 확인한다.
- 정산 가격 소스는 `bybit-linear` 하나로 고정되어 있다.

## 핵심 도메인

### AuthSessionUser

```ts
interface AuthSessionUser {
  userId: string;
  email: string;
  name: string;
  image: string;
  providerHints: string[];
}
```

### MarketData

```ts
interface MarketData {
  coinId: string;
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  priceChange7d: number;
  rsi: number;
  macd: number;
  bollingerUpper: number;
  bollingerLower: number;
  fearGreedIndex: number | null;
  fearGreedLabel: string | null;
  sentimentScore: number | null;
  newsHeadlines: string[];
  newsEventSummary: string | null;
  communitySentimentSummary: string | null;
  longShortRatio: number | null;
  openInterest: number | null;
  fundingRate: number | null;
  whaleScore: number | null;
  whaleFlowSummary: string | null;
  marketStructureSummary: string | null;
  volume24h: number;
}
```

### DebateMessage

```ts
interface DebateMessage {
  id: string;
  characterId: string;
  characterName: string;
  team: "bull" | "bear";
  stance: "bullish" | "bearish" | "neutral";
  summary: string;
  detail: string;
  indicatorLabel: string;
  indicatorValue: string;
  provider: string;
  model: string;
  fallbackUsed: boolean;
  createdAt: string;
}
```

### BattleTimeframe

```ts
type BattleTimeframe = "5m" | "30m" | "1h" | "4h" | "24h" | "7d";
```

### PreparedBattleContext

```ts
interface PreparedBattleContext {
  coinId: string;
  marketData: MarketData;
  summary: {
    headline: string;
    bias: string;
    indicators: Array<{ label: string; value: string }>;
  };
  reusableDebateContext: {
    recentBattleLessons: string[];
    characterLessonsById: Record<string, string[]>;
  };
  preparedEvidence: Record<string, string[]>;
  firstTurnDrafts: Record<string, DebateMessage>;
  preparedAt: string;
}
```

메모:

- 현재 `firstTurnDrafts`는 opening round 캐릭터인 `Aira`, `Ledger` 초안 재사용이 핵심이다.

### BattleSnapshotRecord

```ts
interface BattleSnapshotRecord {
  snapshotId: string;
  userId: string;
  battleId: string | null;
  coinId: string;
  marketData: MarketData | null;
  summary: {
    headline: string;
    bias: string;
    indicators: Array<{ label: string; value: string }>;
  } | null;
  messages: DebateMessage[];
  savedAt: string;
}
```

### UserBattle

```ts
interface UserBattle {
  battleId: string;
  coinId: string;
  coinSymbol: string;
  selectedTeam: "bull" | "bear";
  timeframe: BattleTimeframe;
  selectedPrice: number;
  selectedAt: string;
  snapshotId: string | null;
  settlementAt: string;
  priceSource: "bybit-linear";
  marketSymbol: string;
  settledPrice: number | null;
}
```

### BattleSettlementSnapshot

```ts
interface BattleSettlementSnapshot {
  battleId: string;
  timeframe: BattleTimeframe;
  settlementAt: string;
  priceSource: "bybit-linear";
  marketSymbol: string;
  entryPrice: number;
  settledPrice: number | null;
  priceChangePercent: number | null;
  winningTeam: "bull" | "bear" | "draw" | null;
  status: "pending" | "settled";
}
```

### BattleOutcomeSeed

```ts
interface BattleOutcomeSeed {
  id: string;
  battleId: string;
  coinId: string;
  coinSymbol: string;
  timeframe: BattleTimeframe;
  settlementAt: string;
  priceSource: "bybit-linear";
  marketSymbol: string;
  settledPrice: number;
  winningTeam: "bull" | "bear" | "draw";
  priceChangePercent: number;
  userSelectedTeam: "bull" | "bear";
  userWon: boolean;
  strongestWinningArgument: string;
  weakestLosingArgument: string;
  ruleVersion: "v1";
  createdAt: string;
}
```

### CharacterMemorySeed

```ts
interface CharacterMemorySeed {
  id: string;
  battleId: string;
  coinId: string;
  characterId: string;
  characterName: string;
  team: "bull" | "bear";
  stance: "bullish" | "bearish" | "neutral";
  indicatorLabel: string;
  indicatorValue: string;
  summary: string;
  provider: string;
  model: string;
  fallbackUsed: boolean;
  wasCorrect: boolean;
  createdAt: string;
}
```

### PlayerDecisionSeed

```ts
interface PlayerDecisionSeed {
  id: string;
  battleId: string;
  coinId: string;
  coinSymbol: string;
  selectedTeam: "bull" | "bear";
  timeframe: BattleTimeframe;
  selectedPrice: number;
  snapshotId: string | null;
  settlementAt: string;
  priceSource: "bybit-linear";
  marketSymbol: string;
  settledPrice: number;
  userWon: boolean;
  createdAt: string;
}
```

### BattleReport / ReusableBattleMemo

```ts
interface BattleReport {
  id: string;
  battleId: string;
  outcomeSeedId: string;
  report: string;
  reportSource: "gemini" | "fallback";
  createdAt: string;
}

interface ReusableBattleMemo {
  id: string;
  battleId: string;
  coinId: string;
  coinSymbol: string;
  timeframe: BattleTimeframe;
  reportSource: "gemini" | "fallback";
  reportSummary: string;
  winningTeam: "bull" | "bear" | "draw";
  strongestWinningArgument: string;
  weakestLosingArgument: string;
  globalLessons: string[];
  characterLessons: Array<{
    characterId: string;
    characterName: string;
    lesson: string;
    wasCorrect: boolean;
  }>;
  createdAt: string;
}
```

### UserProgress

```ts
interface UserProgress {
  level: number;
  title: string;
  xp: number;
  wins: number;
  losses: number;
}
```

## 저장 위치

### localStorage

```ts
const storageKeys = {
  recentCoins: "ant_gravity_recent_coins",
  battleSnapshot: "ant_gravity_battle_snapshot",
  userBattle: "ant_gravity_user_battle",
  userLevel: "ant_gravity_user_level",
  appliedBattleResults: "ant_gravity_applied_battle_results",
  battleTimingMetrics: "ant_gravity_battle_timing_metrics",
};
```

추가 규칙:

- `battleSnapshot` TTL: 10일
- `userBattle` TTL:
  - `5m`: 90분
  - `30m`: 3시간
  - `1h`: 4시간
  - `4h`: 12시간
  - `24h`: 36시간
  - `7d`: 10일
- `userLevel`은 `${storageKeys.userLevel}:${userId}` 키를 사용

### 서버 파일 저장

- `battle_snapshot_store.json`
- `battle_prep_cache.json`
- `seed_store.json`
- `report_store.json`
- `event_log.json`
- `battle_result_applications.json`
- `source_cache.json`

### Supabase 미러 저장

- `user_profiles`
- `user_progress`
- `user_recent_coins`
- `battle_snapshots`
- `battle_sessions`
- `battle_outcomes`
- `player_decision_seeds`
- `character_memory_seeds`

메모:

- `battle_sessions` upsert는 `snapshotId`가 있을 때만 의미 있게 저장된다.

## 현재 한계

- 파일 저장소가 여전히 운영 단일 노드 전제를 많이 가진다.
- `pickReadyAt`은 아직 timing metrics에 없다.
- UTF-8 깨짐이 남은 문자열은 문서와 화면 모두에서 정리 대상이다.
