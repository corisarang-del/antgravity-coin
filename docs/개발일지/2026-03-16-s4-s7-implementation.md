# 개발일지 - S4~S7 구현

- 작성시각: 2026-03-16 21:30:00 +09:00
- 해결하고자 한 문제:
  - `docs/planning/06-tasks.md`의 S4~S7 범위는 문서 초안만 있고 실제 코드에는 seed, outcome, report, event log, provider router, optimization 구조가 없었음.
  - 결과 화면에서 XP만 반영되고 회고/저장 흐름이 끊겨 있었고, 멀티 provider 및 관측성 초안도 구현되지 않았음.
- 진행 내용:
  - `BattleOutcomeSeed`, `CharacterMemorySeed`, `PlayerDecisionSeed`, `BattleReport` 도메인 모델을 추가함.
  - `SeedRepository`, `ReportRepository`, `EventLog`, `LlmProvider` 포트와 파일 기반 저장소를 추가함.
  - `buildBattleOutcomeSeed`, `buildMemorySeeds`, `appendSeedEvents`, `generateBattleReport`를 구현함.
  - `/api/battle/outcome` 라우트를 추가해 outcome/memory/report/event 저장 흐름을 연결함.
  - 결과 화면에서 outcome API를 호출하고 `배틀 회고`를 표시하도록 연결함.
  - `ruleVersion`을 `BattleResult`와 outcome seed 흐름에 포함함.
  - `characterModelRoutes`, `providerRuntimeConfig`, `llmRouter`, `llmResponseCache`를 추가해 멀티 provider router 초안을 구현함.
  - 현재는 Anthropic만 실구현하고 나머지 provider는 null provider로 두어 fallback 구조를 유지함.
  - `createBattleTimingTracker`, `optimizeProviderRoutes`, `evaluateShadowModel`, `/api/providers/routes`를 추가해 optimization/관측성 초안을 넣음.
  - `useBattleStream`에 timing metrics 저장을 추가함.
- 해결된 것:
  - S4 seed/event log 저장 구조 초안 구현
  - S5 outcome/report 분리와 결과 화면 저장 흐름 연결
  - S5-4 `ruleVersion` 도입
  - S6 provider 인터페이스와 router 초안 구현
  - S7 timing metrics, route optimization, shadow evaluation 초안 구현
- 해결되지 않은 것:
  - 멀티 provider는 구조만 있고 실제 Anthropic 외 provider API 클라이언트는 아직 null provider다.
  - optimization은 실측 기반 자동 조정까지는 아니고, 수동 평가 입력을 처리하는 초안 수준이다.
  - 전체 `pnpm lint`는 `pptx/ant-gravity-report/*` 하위 기존 CommonJS 파일 때문에 여전히 실패한다. 이번 구현 범위인 `src` 기준 eslint는 통과했다.

