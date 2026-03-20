# battle pick-ready 분리와 병렬 라운드 업그레이드

작성시각: 2026-03-21 KST

## 해결하려고 한 문제

- 첫 발언 prewarm을 해도 선택 가능 시점은 여전히 8명 직렬 토론 완료에 묶여 있었음
- OpenRouter recovery model 풀을 끝까지 도는 구조 때문에 tail latency가 과도하게 커졌음
- 뒤 캐릭터로 갈수록 이전 발언 전체를 계속 넘겨 프롬프트 길이와 지연이 누적됐음

## 이번에 해결한 것

- `battle_pick_ready` 이벤트를 추가해서 양 팀 핵심 논거가 2개씩 모이면 선택 화면 CTA를 먼저 열게 함
- `/api/battle`를 8명 완전 직렬에서 `Aira+Ledger`, `Judy+Shade`, `Clover+Vela`, `Blaze+Flip` 4라운드 병렬 구조로 변경함
- `llmRouter`에서 공통 recovery model 풀 순회를 제거하고 `primary 1회 + fallback 1회`까지만 시도하게 줄임
- `generateCharacterMessage`에서 이전 발언을 `직전 1개 + 보완용 1개 + 공통 요약 1개` 수준으로 압축해서 LLM 입력 토큰을 줄임
- battle feed는 계속 유지하되, 선택 CTA는 `isComplete`보다 먼저 열릴 수 있게 클라이언트 상태를 분리함

## 아직 남은 것

- live OpenRouter 응답 기준 실제 wall-clock이 얼마나 줄었는지 브라우저 실측이 더 필요함
- pick-ready 시점에 사용자가 바로 이동하면 남은 4개 발언은 보지 않고 넘어갈 수 있으니 UX 문구를 더 다듬을 여지가 있음
- active character 표시가 병렬 라운드 기준으로는 여전히 단일 캐릭터 상태라서, 필요하면 이후 다중 진행 상태 표시로 확장할 수 있음

## 검증

- `pnpm.cmd typecheck`
- `pnpm.cmd test -- src/app/api/battle/route.test.ts src/infrastructure/api/llmRouter.test.ts src/application/useCases/generateBattleDebate.test.ts`
- `pnpm.cmd lint`

