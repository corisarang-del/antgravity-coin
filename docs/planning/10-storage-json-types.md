# battle 저장 구조 정리

- 작성시각: 2026-03-21 18:27 KST
- 목적: `database/data`와 localStorage 구조를 현재 코드 기준으로 정리

## 1. JSON 파일 저장소

### `database/data/seed_store.json`

```ts
interface SeedStore {
  battleOutcomeSeeds: BattleOutcomeSeed[];
  characterMemorySeeds: CharacterMemorySeed[];
  playerDecisionSeeds: PlayerDecisionSeed[];
}
```

### `database/data/report_store.json`

```ts
interface ReportStore {
  reports: BattleReport[];
  reusableMemos: ReusableBattleMemo[];
}
```

### `database/data/event_log.json`

```ts
interface StoredEventLog {
  items: EventLogEntry[];
}
```

현재 주요 `type`:

- `battle_start`
- `debate_complete`
- `seed_saved`
- `choice_saved`
- `result_applied`

### `database/data/battle_snapshot_store.json`

```ts
interface BattleSnapshotStore {
  items: BattleSnapshotRecord[];
}
```

### `database/data/battle_prep_cache.json`

```ts
interface PreparedBattleContextStore {
  version: 1;
  items: PreparedBattleContext[];
}
```

### `database/data/battle_result_applications.json`

```ts
interface StoredApplications {
  items: BattleResultApplication[];
}
```

### `database/data/source_cache.json`

```ts
interface SourceCacheStore {
  version: 1;
  items: Array<{
    key: string;
    value: unknown;
    savedAt: string;
  }>;
}
```

## 2. localStorage

### `ant_gravity_battle_snapshot`

```ts
interface BattleSnapshotStorage {
  version: 1;
  snapshotId?: string | null;
  coinId: string;
  marketData: MarketData | null;
  summary: BattleSnapshotRecord["summary"];
  messages: DebateMessage[];
  savedAt?: string;
  savedToServerAt?: string;
}
```

### `ant_gravity_user_battle`

```ts
type UserBattleStorage = UserBattle;
```

### `ant_gravity_battle_timing_metrics`

```ts
interface BattleTimingMetrics {
  requestStartedAt: number;
  marketDataReadyAt: number | null;
  firstCharacterStartedAt: number | null;
  firstMessageDisplayedAt: number | null;
  debateCompletedAt: number | null;
  preparedContextHit: boolean | null;
  preparedFirstTurnHit: boolean | null;
  preparedAtAgeMs: number | null;
}
```

메모:

- 아직 `pickReadyAt`는 없다.

### `ant_gravity_applied_battle_results`

```ts
type AppliedBattleResultsStorage = string[];
```

### `ant_gravity_user_level:[userId]`

```ts
type UserLevelStorage = UserProgress;
```

## 3. Supabase 미러 대상

- `user_profiles`
- `user_progress`
- `user_recent_coins`
- `battle_snapshots`
- `battle_sessions`
- `battle_outcomes`
- `player_decision_seeds`
- `character_memory_seeds`

## 4. 저장 규칙 메모

- snapshot owner mismatch면 저장하지 않는다.
- `battleId -> snapshotId` lookup API가 있어 결과 복구가 가능하다.
- outcome 저장은 `battleId`별 직렬화로 진행된다.
- `battle_sessions`는 `snapshotId`가 있을 때만 실질 upsert된다.
- report에는 `reportSource: "gemini" | "fallback"`가 포함된다.

## 5. 남은 과제

1. timing metrics에 `pickReadyAt` 추가
2. snapshot / prep cache 정리 정책 추가
3. 장기적으로 파일 저장소를 더 안정적인 DB 중심 구조로 이전 검토
