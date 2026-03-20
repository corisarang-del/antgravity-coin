# 개발일지 - planning 기반 즉시 구현 항목 보강

- 작성시각: 2026-03-16 22:12:00 +09:00
- 해결하고자 한 문제:
  - `docs/planning`에 정리된 "현재 남은 즉시 구현 항목" 중 실제 provider 연결, outcome 조회/복구, fallback 안내 UI, SSE error UX가 아직 코드에 충분히 반영되지 않았음.
- 진행 내용:
  - Gemini 공식 API provider와 OpenAI-compatible provider 클라이언트를 추가하고 env 설정을 확장함.
  - Qwen, Kimi, GLM, DeepSeek는 OpenAI-compatible provider로 실제 호출이 가능하도록 연결함.
  - `/api/battle/outcome`에 GET 조회를 추가하고, POST는 기존 저장이 있으면 recovered 응답을 주는 idempotent 흐름으로 보강함.
  - `/api/battle/events` 조회 API를 추가함.
  - `/api/characters` 응답 헤더에 source/fallback 상태를 추가하고, 캐릭터 도감 화면에서 fallback 안내 문구를 노출하도록 함.
  - 배틀 화면에서 SSE error 발생 시 `다시 시도`, `홈으로 이동`, 부분 결과 유지 안내를 노출하도록 보강함.
  - 결과 화면에서 outcome 저장 실패와 applied 저장 실패를 분리해 오류 문구를 보여주고, 이미 저장된 결과는 GET 조회로 다시 읽도록 보강함.
  - 관련 테스트를 추가/보강함.
- 해결된 것:
  - planning 문서의 "바로 구현해야 할 미구현" 중 provider 실제 연결 구조, outcome/report/event 조회, fallback 안내 UI, SSE error UX가 실제 코드에 반영됨.
  - 비-Anthropic provider 중심 + Anthropic 최후 fallback 구조를 유지한 채 실제 호출 가능 경로를 마련함.
  - 결과 저장 흐름이 더 idempotent하게 동작하도록 보강됨.
- 해결되지 않은 것:
  - 실제 provider API 키와 엔드포인트가 없으면 비-Anthropic provider는 여전히 null 응답이어서 fallback으로 간다.
  - provider optimization, shadow evaluation, timing metrics 활용은 여전히 초안 수준이다.
  - 전체 `pnpm lint`는 여전히 `pptx` 하위 기존 파일 때문에 실패 가능성이 남아 있다. 이번 검증은 `src` 기준 eslint를 사용했다.

