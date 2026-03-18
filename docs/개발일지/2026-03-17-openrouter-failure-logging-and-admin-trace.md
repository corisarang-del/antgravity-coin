# 개발일지 - OpenRouter 실패 로그 확장과 운영자 추적 강화

- 작성시각: 2026-03-17 01:20:00 +09:00
- 해결하고자 한 문제:
  - `MiniMax`, `StepFun`이 왜 fallback을 타는지 원인 분리가 어려웠고, 운영자 대시보드에서도 어떤 캐릭터가 어떤 모델을 실제로 썼는지 바로 보기 어려웠음.
- 진행 내용:
  - `openRouterProvider`에 `status`, `timeout`, `body 일부`, `parse 실패`, `empty content`, `missing_api_key` 로그를 추가함.
  - `DebateMessage`, `CharacterMemorySeed`에 `provider`, `model`, `fallbackUsed`를 포함시킴.
  - `llmRouter`가 메타데이터를 함께 반환하도록 유지하고, event log / SSE / outcome 응답에 반영함.
  - 운영자 대시보드에서 `reportSource`, 캐릭터별 `provider`, `model`, `fallbackUsed`, event payload를 확인할 수 있게 보강함.
  - 전체 테스트, 타입체크, 린트를 다시 통과시킴.
- 해결된 것:
  - 이제 어떤 캐릭터가 어떤 모델을 썼는지 100% 추적 가능함.
  - 운영자 대시보드에서 `reportSource`, `provider`, `model`, `fallbackUsed`를 바로 확인할 수 있음.
  - OpenRouter 실패 원인이 서버 로그에 더 구체적으로 남도록 개선됨.
- 해결되지 않은 것:
  - dev 서버가 분리 프로세스로 떠 있어서 현재 대화 스레드에서 서버 로그를 바로 읽는 방식은 제한적임.
  - MiniMax/StepFun 실패 원인은 개별 배틀 수행 후 서버 콘솔 로그를 추가로 확인해야 가장 명확함.
