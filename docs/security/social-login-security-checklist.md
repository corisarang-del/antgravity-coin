# social login security checklist

## 코드에서 자동 검증할 것

- [x] OAuth 시작 시 redirectTo가 내부 callback 경로를 사용한다
  - 기준 파일: `src/app/login/LoginPageClient.tsx`
- [x] callback에서 `next`가 내부 경로(`/` 시작)만 허용된다
  - 기준 파일: `src/app/auth/callback/route.ts`
- [x] callback에서 code 교환 실패 시 로그인 에러 화면으로 보낸다
  - 기준 파일: `src/app/auth/callback/route.ts`
- [x] 로그아웃 시 서버 `signOut()`을 호출한다
  - 기준 파일: `src/app/api/auth/signout/route.ts`
- [x] 만료/무효 세션은 서버에서 `auth.getUser()`로 재검증한다
  - 기준 파일: `src/infrastructure/auth/updateSession.ts`
  - 기준 파일: `src/app/api/auth/session/route.ts`

## 대시보드에서 수동 확인할 것

- [ ] Supabase Dashboard > Authentication > URL Configuration 에 배포 도메인의 callback URL만 등록돼 있는지 확인
  - 예: `https://your-domain.com/auth/callback`
  - 로컬 개발 URL도 필요한 것만 등록
- [ ] Google OAuth redirect URI가 Supabase callback URL과 정확히 일치하는지 확인
- [ ] Kakao OAuth redirect URI가 Supabase callback URL과 정확히 일치하는지 확인
- [ ] 허용되지 않은 preview/임시 도메인이 OAuth redirect allowlist에 남아있지 않은지 확인

## state 파라미터 점검

- [ ] 브라우저 개발자도구 Network에서 OAuth 시작 요청에 state/PKCE 관련 파라미터가 생성되는지 확인
- [ ] callback에서 state 불일치 상황을 Supabase가 차단하는지 테스트 환경에서 확인
- [ ] 앱 코드가 state를 직접 검증하지 않는다면, Supabase SDK 기본 보호에 의존한다는 점을 팀에 명시

## 토큰 만료/세션 점검

- [ ] access token 만료 후 새 요청에서 비정상적으로 로그인 상태가 유지되지 않는지 확인
- [ ] `/me`, `/api/me`, `/api/auth/session`이 만료 세션에서 비인증 응답으로 바뀌는지 확인
- [ ] proxy/session refresh가 실제 배포 환경의 도메인, secure cookie 설정과 맞는지 확인

## 로그아웃 점검

- [ ] 로그아웃 후 `/api/auth/session`이 `isAuthenticated: false`를 반환하는지 확인
- [ ] 로그아웃 후 보호 페이지(`/me`) 재진입 시 로그인으로 이동하는지 확인
- [ ] 필요하면 provider token revoke 정책이 필요한지 결정
  - 현재 코드는 앱 세션 종료 중심
  - Google/Kakao provider access token 강제 revoke는 별도 정책

## 권장 추가 점검

- [ ] callback 실패 원인을 서버 로그에서 구분 가능하게 남길지 결정
- [ ] OAuth provider별 허용 이메일 도메인/관리자 계정 정책이 필요한지 결정
- [ ] 인증 관련 route에 보안 회귀 테스트를 CI에 포함
## 2026-03-27 추가 메모

- 현재 코드 기준으로 social login 자체의 핵심 흐름은 계속 유효
  - `next`는 내부 경로만 허용
  - callback 실패 시 로그인 에러 화면으로 보냄
  - signout은 서버 `signOut()` 호출
- 이번 보안 수정과 직접 연결되는 추가 체크포인트는 아래 두 가지임
  - 로그인 후 guest 상태를 계정으로 병합할 때도 클라이언트 로컬 진행도를 신뢰하지 않게 바뀌었는지 유지 확인
  - 배포 환경에 `GUEST_SESSION_SECRET`가 실제로 설정돼 있는지 확인
