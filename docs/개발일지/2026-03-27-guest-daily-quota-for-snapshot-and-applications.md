# guest 저장 API 일일 quota 추가

- 작성시각: 2026-03-27 10:40:07 +09:00
- 해결하고자 한 문제:
  - `/api/battle/snapshot`와 `/api/battle/applications`는 분당 rate limit만 있고 하루 누적 쓰기 상한이 없었음
  - 운영 환경의 shared rate limit RPC는 최대 1시간 윈도우만 허용해서 24시간 quota를 그대로 적용할 수 없었음
- 해결된 것:
  - 두 route의 `POST`에 `일 240회` daily quota를 추가함
  - 분당 초과는 `rate_limit_exceeded`, 일일 초과는 `daily_quota_exceeded`로 구분해서 429를 반환하게 함
  - shared rate limit 함수가 24시간 윈도우를 허용하도록 Supabase migration을 추가함
  - snapshot/applications route 테스트에 daily quota 초과 케이스를 추가함
  - `pnpm lint`, `pnpm typecheck`, 대상 테스트 2개 파일 통과를 확인함
- 아직 해결되지 않은 것:
  - GET 요청에는 daily quota를 걸지 않았음
  - 필요하면 로그인 사용자와 guest 사용자 quota를 다르게 나누는 정책은 추가 가능함
