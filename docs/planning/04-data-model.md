# 데이터 모델

## 핵심 원칙

- GPS 같은 민감 개인정보는 저장하지 않는다.
- 사용자 식별은 익명 세션 쿠키 `ant_gravity_user_id`를 사용한다.
- 사용자 선택과 레벨은 로컬스토리지 중심으로 저장한다.
- 결과 중복 적용 여부만 서버 파일 저장소에 남긴다.

---

## 현재 구현 도메인 모델

### Coin

```ts
interface Coin {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  marketCap: number;
  thumb: string;
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
  fearGreedIndex: number;
  fearGreedLabel: string;
  sentimentScore: number;
  longShortRatio: number;
  openInterest: number;
  fundingRate: number;
  whaleScore: number;
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
  createdAt: string;
}
```

### UserBattle

```ts
interface UserBattle {
  battleId: string;
  coinId: string;
  coinSymbol: string;
  selectedTeam: "bull" | "bear";
  timeframe: "24h" | "7d";
  selectedPrice: number;
  selectedAt: string;
}
```

### BattleResult

```ts
interface BattleResult {
  coinId: string;
  timeframe: "24h" | "7d";
  winningTeam: "bull" | "bear" | "draw";
  priceChangePercent: number;
  userWon: boolean;
  xpDelta: number;
  ruleVersion: "v1";
}
```

### UserLevel

```ts
interface UserLevel {
  level: number;
  title: string;
  xp: number;
  wins: number;
  losses: number;
}
```

### CharacterCatalogEntry

```ts
interface CharacterCatalogEntry {
  id: string;
  name: string;
  role: string;
  team: "bull" | "bear";
  specialty: string;
  emoji: string;
  imageFileName: string;
  sourceImageName: string;
  personality: string;
  selectionReason: string;
  accentTone: "rose" | "cream" | "butter";
}
```

---

## 저장 계층

### 로컬스토리지

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

### 서버 파일 저장소

```ts
database/data/battle_result_applications.json
```

저장 목적:
- 같은 `battleId`와 `userId` 조합에 대해 결과가 여러 번 반영되지 않도록 막는다.

### BattleSnapshot 로컬스토리지 계약

```ts
interface BattleSnapshotStorage {
  version: 1;
  coinId: string;
  marketData: MarketData | null;
  summary: {
    headline: string;
    bias: string;
    indicators: Array<{
      label: string;
      value: string;
    }>;
  } | null;
  messages: DebateMessage[];
  savedAt: string;
}
```

운영 원칙:
- 로컬스토리지 파싱 실패 시 snapshot은 즉시 폐기한다.
- `version`이 다르면 구버전 데이터로 보고 폐기한다.
- 구조 변경 시 `version`을 증가시키고 마이그레이션보다 폐기를 기본 정책으로 둔다.

---

## 문서에서 제거한 가정

- 현재 코드에는 `AnalysisResult` 단일 종합 모델이 없다.
- 현재 배틀 데이터는 평탄한 `MarketData` 구조를 사용한다.

---

## 현재 데이터 리스크와 후속 과제

- `priceChange7d`는 현재 파생값 기반이라 정확도 리스크가 있다.
- 결과 중복 적용 방지 저장소는 현재 JSON 파일 기반이라 운영 확장 시 별도 저장 전략 검토가 필요하다.
- seed / outcome / report / event log는 기본 저장 구조는 도입됐지만 활용 계층이 아직 약하다.
- provider route, timing metrics, shadow evaluation은 저장 또는 계산 초안만 있고 자동화 계층이 약하다.

---

## seed / outcome / report / event log 최소 스키마 초안

### BattleOutcomeSeed

```ts
interface BattleOutcomeSeed {
  id: string;
  battleId: string;
  coinId: string;
  winningTeam: "bull" | "bear" | "draw";
  ruleVersion: "v1";
  createdAt: string;
}
```

저장 시점:
- 결과 계산 직후, XP 반영 전에 생성한다.

### CharacterMemorySeed

```ts
interface CharacterMemorySeed {
  id: string;
  battleId: string;
  characterId: string;
  team: "bull" | "bear";
  summary: string;
  indicatorLabel: string;
  indicatorValue: string;
  createdAt: string;
}
```

저장 시점:
- 각 캐릭터 발언 확정 후 또는 배틀 종료 직후 일괄 저장한다.

### PlayerDecisionSeed

```ts
interface PlayerDecisionSeed {
  id: string;
  battleId: string;
  userId: string;
  selectedTeam: "bull" | "bear";
  timeframe: "24h" | "7d";
  selectedAt: string;
}
```

저장 시점:
- 사용자가 pick 화면에서 선택을 확정한 직후 저장한다.

### BattleReport

```ts
interface BattleReport {
  id: string;
  battleId: string;
  outcomeSeedId: string;
  report: string;
  createdAt: string;
}
```

저장 시점:
- 결과 화면 진입 시점 또는 결과 확정 직후 생성한다.

생성 원칙:
- `Gemini`가 결과 요약과 승부 근거 재정리를 담당한다.
- 단, `winningTeam`과 `ruleVersion`은 계산된 결과를 그대로 사용한다.

### EventLog

```ts
interface EventLog {
  id: string;
  battleId: string;
  userId?: string;
  createdAt: string;
  type:
    | "battle_start"
    | "debate_complete"
    | "choice_saved"
    | "result_applied"
    | "seed_saved";
  payload: Record<string, unknown>;
}
```

운영 원칙:
- 모든 이벤트는 append-only로 저장한다.
- `id`는 재시도 중복을 줄이기 위해 UUID 계열을 기본으로 한다.
- `payload`는 이벤트별 세부 데이터만 담고, 공통 키는 최상위 필드에 둔다.

---

## 결과 규칙 버전 관리

- `BattleResult.ruleVersion`을 기본 위치로 사용한다.
- 초기 규칙 버전은 `"v1"`로 고정한다.
- 승패 계산식이나 XP 정책이 바뀌면 새로운 버전을 발급한다.
- 과거 배틀은 당시 저장된 `ruleVersion` 기준으로만 해석한다.
