# Supabase Auth와 유저 페이지 추가

작성시각: 2026-03-20 15:10 KST

## 해결하려고 한 문제

- 익명 쿠키만으로는 계정 기반 로그인, 멀티디바이스 기록 복원이 안 되는 문제
- 로그인 페이지와 유저 페이지가 없는 문제
- 계정 사용자 배틀 기록을 DB에 영구 저장하는 흐름이 없는 문제

## 해결된 것

- Supabase SSR client, callback, 세션 래퍼를 추가했다.
- 로그인 페이지 `/login`과 유저 페이지 `/me`를 추가했다.
- `/api/me`, `/api/me/progress`, `/api/me/battles`, `/api/me/battles/[battleId]`, `/api/auth/signout`, `/api/auth/merge-local`을 추가했다.
- snapshot/session/outcome 저장 흐름에 로그인 사용자 DB 저장을 연결했다.
- Supabase DB 테이블과 RLS 마이그레이션을 추가하고 적용했다.
- 헤더를 로그인/게스트 상태에 맞게 확장했다.

## 아직 안 된 것

- Kakao, Google provider 실서비스 연결값은 Supabase Dashboard 설정과 env 주입이 필요하다.
- `/me` 상세 리포트 화면은 아직 목록 중심이다.

