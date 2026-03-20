# 프롬프트 기록 - provider 추적성과 실런타임 검증

- 작성시각: 2026-03-17 01:05:00 +09:00
- 해결하고자 한 문제:
  - `MiniMax` 같은 특정 모델이 실제로 호출되는지, 또는 `Qwen` fallback으로 넘어가는지 확인할 방법이 필요했음.
- 사용자 요청 요약:
  - event log에 `provider`, `model`, `fallbackUsed` 저장
  - SSE `character_done`에 같은 메타데이터 추가
  - `/api/battle/outcome` 저장 결과에 `reportSource` 추가
  - 실제로 누가 어떤 모델을 썼는지 100% 추적 가능하게 해달라는 요청
- 이번 작업에서 구현한 핵심:
  - `DebateMessage` 메타데이터 확장
  - `llmRouter` 결과 메타데이터화
  - event log / SSE / outcome 응답에 추적 필드 추가
  - 실제 샘플 배틀 끝까지 실행해서 런타임 모델 사용 결과 확인
- 검증 결과:
  - `pnpm test`, `pnpm typecheck`, `pnpm lint` 통과
  - 샘플 배틀 `messageCount=8`, `reportSource=gemini` 확인

