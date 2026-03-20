# Prepared Battle Context Speedup

- 작성시각: 2026-03-20 21:35 KST
- 해결하고자 한 문제:
  - 배틀 토론 첫 발언 체감 속도를 줄이고 싶었음
  - 기존 timeout/fallback/prewarm 구조는 유지하면서 첫 발언 재사용 레이어를 추가할 필요가 있었음

## 해결된 것

- `PreparedBattleContext` 타입과 파일 저장소를 추가했음
- coin별로 `marketData`, `summary`, `reusableDebateContext`, `preparedEvidence`, `firstTurnDrafts`, `preparedAt`를 저장하는 준비 컨텍스트 레이어를 만들었음
- `/api/battle`가 준비 컨텍스트를 먼저 읽고, 첫 캐릭터 초안이 있으면 그 초안을 즉시 재사용하도록 변경했음
- 첫 캐릭터 이후 발언은 기존처럼 실시간 `previousMessages` 기반 생성 흐름을 유지했음
- `prewarmMarketCache`를 battle prep까지 확장해서 `/api/admin/cache/prewarm`이 준비 컨텍스트도 같이 만들게 했음
- timing metrics에 `preparedContextHit`, `preparedFirstTurnHit`, `preparedAtAgeMs`를 추가했음
- `pnpm lint`, `pnpm typecheck`, `pnpm test` 통과

## 해결되지 않은 것

- 브라우저에서 실제 prewarm hit 상태로 첫 발언 체감 속도 비교 측정은 아직 별도로 하지 않았음
- 준비 컨텍스트를 UI에서 직접 노출하거나 운영 메트릭으로 수집하는 단계는 후속 작업임
