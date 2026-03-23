# login me dashboard implementation

- 작성시각: 2026-03-23 21:34 KST
- 해결하고자 한 문제:
  - `06-tasks.md`의 `T5`, `T6` 범위가 문서에만 있고 실제 화면엔 아직 완전히 반영되지 않았음
  - `/login`은 통합 로그인/회원가입 의미와 실패 안내가 약했고, `/me`는 프로필/XP/등급/전적이 첫 화면에서 충분히 강조되지 않았음

## 해결된 것

- `src/app/login/LoginPageClient.tsx`
  - 통합 로그인/회원가입 카피로 정리
  - `Google`, `Kakao` CTA를 더 분명하게 노출
  - `oauth_callback_failed` 안내 문구 추가
- `src/app/me/page.tsx`
  - 등급 카드 추가
  - provider 표기를 정리
  - 최근 battle 기록을 5개 기준으로 압축
  - 기본 화면을 요약 대시보드 쪽으로 더 기울게 조정
- `src/presentation/components/AppHeader.tsx`
  - 비로그인 CTA를 `로그인/회원가입`으로 변경
- `src/app/login/LoginPageClient.test.tsx`
  - OAuth 진입과 에러 문구 렌더 테스트 추가

## 해결되지 않은 것

- 실제 브라우저에서 spacing, 톤, 가독성 최종 확인은 아직 필요함
- `/me` 상세 영역을 더 과감히 접을지 여부는 사용감 확인 후 추가 조정 가능함
