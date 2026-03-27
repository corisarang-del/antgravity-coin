# social login 보안 체크리스트와 테스트 추가

- 작성시각: 2026-03-27 10:49:00 +09:00
- 해결하고자 한 문제:
  - 소셜 로그인 흐름에서 state, redirect, token expiry, logout 관련 보안 점검 항목을 코드와 운영 설정 기준으로 분리해서 검증할 필요가 있었음
  - 자동으로 검증 가능한 부분은 테스트로 고정하고, 대시보드에서만 확인 가능한 부분은 문서로 남길 필요가 있었음
- 해결된 것:
  - `/auth/callback` route 테스트를 추가해서 성공 리다이렉트, 외부 next 차단, code 교환 실패, code 누락 시 에러 리다이렉트를 검증함
  - `/api/auth/signout` route 테스트를 추가해서 서버 `signOut()` 호출을 검증함
  - 소셜 로그인 보안 체크리스트 문서를 추가해서 코드 검증 항목과 대시보드 수동 확인 항목을 나눠 정리함
  - `pnpm lint`, `pnpm typecheck`, 대상 테스트 3개 파일 통과를 확인함
- 아직 해결되지 않은 것:
  - OAuth state 파라미터 자체는 앱 코드가 직접 검증하지 않고 Supabase SDK 흐름에 의존함
  - callback URL allowlist는 Supabase/Google/Kakao 대시보드 설정이라 저장소 코드만으로는 확정 불가함
