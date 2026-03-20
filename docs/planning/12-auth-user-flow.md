# 로그인과 유저 페이지 구현 메모

작성시각: 2026-03-20 18:10 KST

## 구현 기준

- 인증: Supabase Auth
- provider: Google, Kakao
- 세션: `@supabase/ssr` 기반 쿠키 세션
- 공개 페이지: `/login`
- 보호 페이지: `/me`, `/api/me/*`
- 헤더 초기 인증 상태는 서버에서 만든 `initialCurrentUserSnapshot`으로 전달

## 현재 구현 흐름

1. 브라우저에서 `/login` 진입
2. 로그인 페이지에서 `signInWithOAuth`
3. `/auth/callback`에서 `exchangeCodeForSession`
4. 보호 페이지 진입 시 서버가 `getInitialCurrentUserSnapshot()` 생성
5. 각 페이지가 `AppHeader`에 초기 세션 스냅샷 전달
6. 클라이언트 store는 첫 구독 시 그 스냅샷으로 1회 부트스트랩
7. 이후 로그아웃 또는 재검증 시 `/api/auth/session`으로 실제 세션을 다시 조회
8. `/me` 진입 시 local 익명 상태를 `/api/auth/merge-local`로 1회 병합

## 헤더/세션 동기화 규칙

- 첫 렌더는 서버 스냅샷을 우선 사용한다.
- 이 서버 스냅샷은 초기 표시용 부트스트랩 데이터다.
- `refreshCurrentUserStore()` 이후에는 다시 `/api/auth/session` fetch가 실행되어 최신 인증 상태를 반영한다.
- 따라서 로그아웃 직후 이전 사용자명이 고정된 채 남지 않도록 설계한다.

## 게스트 공존 정책

- 비로그인 사용자는 기존 battle 흐름을 그대로 사용
- 게스트 식별자는 `ant_gravity_user_id` 쿠키 사용
- 로그인 사용자는 Supabase auth user id를 owner id로 우선 사용
- merge 시 게스트 쿠키 기반 legacy 기록을 계정 쪽으로 가져온다

## `/characters`와 인증의 관계

- `/characters`는 공개 페이지다.
- 헤더는 다른 주요 화면과 동일하게 서버 초기 세션 스냅샷을 받는다.
- 캐릭터 소스 상태 문구는 서버에서 계산해서 내려주며, 클라이언트에서 `/api/characters`를 다시 호출하지 않는다.

## 후속 고려사항

- Kakao provider 실제 활성화 여부는 Supabase Dashboard 설정 필요
- `/me` 상세 필터, 배틀 상세 UI, 설정 화면은 후속 범위
