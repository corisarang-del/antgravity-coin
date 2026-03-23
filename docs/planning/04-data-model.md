# 데이터 모델

- 작성시각: 2026-03-21 18:27 KST
- 기준: `src/domain/models/*`, `storageKeys`, battle 관련 use case

## 제약

- GPS 같은 민감 정보는 저장하지 않는다.
- owner는 `auth user id -> guest cookie id` 규칙으로 계산한다.
- 결과 저장은 `battleId` 단위 직렬화로 중복 계산을 막는다.
- 결과 정산 가격 소스는 현재 `bybit-linear` 고정이다.

## 핵심 도메인 모델

### MarketData

시장 데이터, 지표, 뉴스 요약, 파생 지표를 한 번에 담는 battle 입력 모델이다.

주요 필드:

- `coinId`
- `symbol`
- `currentPrice`
- `priceChange24h`
- `priceChange7d`
- `rsi`
- `macd`
- `bollingerUpper`
- `bollingerLower`
- `fearGreedIndex`
- `fearGreedLabel`
- `sentimentScore`
- `newsHeadlines`
- `newsEventSummary`
- `communitySentimentSummary`
- `longShortRatio`
- `openInterest`
- `fundingRate`
- `whaleScore`
- `whaleFlowSummary`
- `marketStructureSummary`
- `volume24h`

### DebateMessage

캐릭터 한 명의 발언 단위다.

주요 필드:

- `id`
- `characterId`
- `characterName`
- `team`
- `stance`
- `summary`
- `detail`
- `indicatorLabel`
- `indicatorValue`
- `provider`
- `model`
- `fallbackUsed`
- `createdAt`

### BattleTimeframe

- `5m`
- `30m`
- `1h`
- `4h`
- `24h`
- `7d`

### PreparedBattleContext

battle 시작 전에 준비되는 예열 컨텍스트다.

주요 필드:

- `coinId`
- `marketData`
- `summary`
- `reusableDebateContext`
- `preparedEvidence`
- `firstTurnDrafts`
- `preparedAt`

메모:

- 현재 `firstTurnDrafts`는 opening round인 `Aira`, `Ledger` 위주로 재사용된다.

### BattleSnapshotRecord

토론 중간 또는 완료 시점 복구용 스냅샷이다.

주요 필드:

- `snapshotId`
- `userId`
- `battleId`
- `coinId`
- `marketData`
- `summary`
- `messages`
- `savedAt`

### UserBattle

사용자 선택 상태와 정산 기준을 담는다.

주요 필드:

- `battleId`
- `coinId`
- `coinSymbol`
- `selectedTeam`
- `timeframe`
- `selectedPrice`
- `selectedAt`
- `snapshotId`
- `settlementAt`
- `priceSource`
- `marketSymbol`
- `settledPrice`

### BattleSettlementSnapshot

실캔들 정산 결과를 표현한다.

주요 필드:

- `battleId`
- `timeframe`
- `settlementAt`
- `priceSource`
- `marketSymbol`
- `entryPrice`
- `settledPrice`
- `priceChangePercent`
- `winningTeam`
- `status`

### BattleOutcomeSeed

정산 직후 저장되는 핵심 결과 seed다.

주요 필드:

- `id`
- `battleId`
- `coinId`
- `coinSymbol`
- `timeframe`
- `settlementAt`
- `priceSource`
- `marketSymbol`
- `settledPrice`
- `winningTeam`
- `priceChangePercent`
- `userSelectedTeam`
- `userWon`
- `strongestWinningArgument`
- `weakestLosingArgument`
- `ruleVersion`
- `createdAt`

### CharacterMemorySeed

캐릭터별 발언 평가용 seed다.

주요 필드:

- `id`
- `battleId`
- `coinId`
- `characterId`
- `characterName`
- `team`
- `stance`
- `indicatorLabel`
- `indicatorValue`
- `summary`
- `provider`
- `model`
- `fallbackUsed`
- `wasCorrect`
- `createdAt`

### PlayerDecisionSeed

사용자 선택과 정산 결과를 연결하는 seed다.

주요 필드:

- `id`
- `battleId`
- `coinId`
- `coinSymbol`
- `selectedTeam`
- `timeframe`
- `selectedPrice`
- `snapshotId`
- `settlementAt`
- `priceSource`
- `marketSymbol`
- `settledPrice`
- `userWon`
- `createdAt`

### BattleReport

결과 report 저장 모델이다.

주요 필드:

- `id`
- `battleId`
- `outcomeSeedId`
- `report`
- `reportSource`
- `createdAt`

### ReusableBattleMemo

다음 battle에 재활용 가능한 lesson 묶음이다.

주요 필드:

- `id`
- `battleId`
- `coinId`
- `coinSymbol`
- `timeframe`
- `reportSource`
- `reportSummary`
- `winningTeam`
- `strongestWinningArgument`
- `weakestLosingArgument`
- `globalLessons`
- `characterLessons`
- `createdAt`

### UserProgress

- `level`
- `title`
- `xp`
- `wins`
- `losses`

## localStorage 키

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

- `userLevel`은 `${storageKeys.userLevel}:${userId}` 형태로 사용된다.
- `battleSnapshot` TTL: 10분
- `userBattle` TTL:
  - `5m`: 90분
  - `30m`: 3시간
  - `1h`: 4시간
  - `4h`: 12시간
  - `24h`: 36시간
  - `7d`: 10일

## timing metrics 모델

현재 local timing metrics 필드:

- `requestStartedAt`
- `marketDataReadyAt`
- `firstCharacterStartedAt`
- `firstMessageDisplayedAt`
- `debateCompletedAt`
- `preparedContextHit`
- `preparedFirstTurnHit`
- `preparedAtAgeMs`

미구현:

- `pickReadyAt`

## 현재 한계

1. 파일 저장소가 운영 환경 기준으로는 한계가 있다.
2. `pickReadyAt`가 아직 모델에 없다.
3. 일부 문서와 문자열에 UTF-8 깨짐 흔적이 남아 있다.
