# 프롬프트 기록 - OpenRouter 우선과 Gemini 직결 결정 반영

- 작성시각: 2026-03-16 22:55:00 +09:00
- 해결하고자 한 문제:
  - 사용자가 `OpenRouter`로 먼저 가고, `Gemini`는 직결 API를 쓰며, timeout/retry/rate limit 수치와 조사 입력 경계, 최종 취합 책임까지 구체화하길 원했음.
- 사용자 요청 요약:
  - `OpenRouter`로 갈 것
  - `Gemini`는 직결 API
  - provider별 timeout, retry, rate limit 기준 문서화
  - 공통 스냅샷과 역할 전용 evidence 경계 구체화
  - 최종 취합 에이전트는 요약 + 승부 근거 재정리 담당
  - 관련 planning 문서 업데이트와 구현 전 문제점 재점검
- 반영한 핵심:
  - `01-prd.md`, `04-data-model.md`, `05-api-spec.md`, `06-tasks.md`에 위 결정을 반영함.

