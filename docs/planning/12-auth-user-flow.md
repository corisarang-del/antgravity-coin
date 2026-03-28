# 로그인과 유저 페이지 구현 메모

- 작성시각: 2026-03-21 03:01 KST
- 기준: 현재 `auth`, `merge-local`, `/me`, Supabase persistence

## 구현 기준

- 인증: Supabase Auth
- provider: Google, Kakao
- 세션: `@supabase/ssr` 기반 쿠키 세션
- 공개 페이지: `/login`
- 보호 페이지: `/me`, `/api/me/*`
- 헤더 초기 상태: 서버 `initialCurrentUserSnapshot`
- owner 계산: `auth user id -> guest cookie id`

## 현재 흐름

1. `/login` 진입
2. `signInWithOAuth`
3. `/auth/callback`에서 세션 교환
4. 서버가 `getInitialCurrentUserSnapshot()` 생성
5. `AppHeader`에 초기 스냅샷 주입
6. 클라이언트 store가 첫 렌더를 이어받음
7. 이후 `GET /api/auth/session`으로 실제 세션 재검증 가능
8. `/me` 진입 시 `MergeLocalStateClient`가 local 상태를 1회 병합

## owner 규칙

- 로그인 상태
  - Supabase auth user id를 owner로 사용
- 비로그인 상태
  - `ant_gravity_user_id` guest 쿠키를 owner로 사용
- 공통
  - `getRequestOwnerId()`가 API owner 계산을 담당

## merge-local 범위

`POST /api/auth/merge-local`는 아래를 계정으로 가져간다.

- local user level -> `user_progress`
- recent coins -> `user_recent_coins`
- 현재 `userBattle` -> `battle_sessions`
- 현재 `battleSnapshot` -> `battle_snapshots`
- guest owner로 남아 있던 outcome/report/seed/snapshot 자산 -> Supabase battle 자산

응답:

```ts
{
  ok: true;
  importedBattleIds: string[];
}
```

## battle 저장과 인증의 관계

- `/api/battle/snapshot`
  - guest, auth 모두 파일 저장
  - auth면 `battle_snapshots`도 upsert
- `/api/battle/session`
  - auth만 `battle_sessions` 저장
  - 비로그인은 `skipped: "unauthenticated"`
- `/api/battle/outcome`
  - 파일 저장소는 항상 기록
  - auth면 outcome, player decision, character memory까지 Supabase 미러 저장

메모:

- `persistAuthenticatedBattleSession()`은 `snapshotId`가 없으면 실질 저장을 건너뛴다.

## `/me` 구현 상태

- 비로그인이면 `/login?next=/me` redirect
- 서버 조회 항목
  - `user_profiles`
  - `user_progress`
  - `battle_sessions`
  - 선택 battle의 `battle_outcomes`, `battle_snapshots`, `player_decision_seeds`, `character_memory_seeds`
- 따라서 `/me`는 단순 프로필 페이지가 아니라 인증 사용자 battle archive 진입점이다.

## local 레벨 저장 규칙

- localStorage 키는 `ant_gravity_user_level:[userId]`
- `/result`에서 XP 반영 후 `useUserLevelStore`가 사용자별로 저장
- `/me`는 서버 progress와 별개로 local merge 진입점 역할도 함

## 현재 남은 과제

1. guest -> auth 병합 성공 UX를 더 분명히 보여주기
2. `/admin/*` 접근 제어 추가
3. `/me` 상세의 필터, 정렬, 상태 배지 개선

## 2026-03-23 인증 UX / `/me` 대시보드 방향 추가

### `/login` 정의 보강

- `/login`은 로그인 전용 페이지가 아니라 `로그인 또는 회원가입` 통합 OAuth 페이지로 본다.
- 소셜 진입은 계속 `Google`, `Kakao` 두 provider를 사용한다.
- 첫 OAuth 로그인도 별도 가입 폼 없이 회원가입 완료로 간주한다.
- `next` 쿼리 유지와 `/auth/callback` 교환 흐름은 그대로 둔다.
- callback 실패 시 `error=oauth_callback_failed`를 사용자 문구로 보여주는 방향을 추가한다.

### `/me` 노출 우선순위 보강

- `/me`의 현재 의미는 battle archive 진입점이 맞지만, 첫 진입 화면은 요약 대시보드 우선 노출로 강화한다.
- 첫 화면 핵심 정보는 아래다.
  - 프로필
  - XP
  - 등급
  - 승패 기록
- 최근 battle 기록은 압축 리스트로 먼저 보여주고, 상세는 선택 시 확장하는 구조를 유지한다.
- 긴 리포트, 토론, character memory는 기본 화면보다 뒤로 배치한다.

### 등급 규칙 메모

- 등급은 새 체계를 만들지 않고 기존 XP 5단계 노출을 강화한다.
- 등급명은 아래를 유지한다.
  - `개미`
  - `새싹개미`
  - `중급개미`
  - `고수개미`
  - `전설개미`

## 2026-03-23 구현 / 런타임 메모 추가

### 구현 반영 상태

- `/login`
  - 통합 로그인/회원가입 카피 반영
  - `Google`, `Kakao` OAuth 버튼 유지
  - callback 실패 상태 문구 추가
- `/me`
  - 프로필, XP, 등급, 승패를 상단에 우선 노출
  - 최근 battle 기록은 5개 기준으로 압축
- 헤더
  - 비로그인 CTA를 `로그인/회원가입`으로 정리

### 런타임 이슈 메모

- dev 서버가 꼬인 상태로 3000 전체 404를 반환한 적이 있었음
- 3000 점유 프로세스 종료와 `.next/dev/lock` 제거 후 다시 확인함
- 이후 로그인 클릭 시 `@supabase/ssr`의 URL / publishable key 에러가 보였음
- 하지만 실제 `.env`, `.env.local`에는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`가 존재함
- 따라서 현재 우선순위는 코드보다 dev 서버 재기동과 env 로딩 상태 재확인이다

## 2026-03-23 로그인 화면 현재 구현 append

- 로그인 화면 headline은 현재 `바로시작` 한 줄 카피를 기준으로 운영된다.
- Google / Kakao 버튼은 보조 설명을 줄여 버튼 선택 자체가 먼저 보이게 정리됐다.
- 상단 설명문, 에러 안내, 하단 보조 카피는 확대된 설명문 규칙을 적용받는다.

## 2026-03-27 인증 보안/회귀 테스트 메모

- `GET /auth/callback`
  - 외부 `next`는 계속 내부 경로로 강제됨
  - `code` 교환 실패 시 `oauth_callback_failed`로 로그인 화면 복귀
  - 회귀 테스트 파일: `src/app/auth/callback/route.test.ts`
- `POST /api/auth/signout`
  - 서버 `signOut()` 호출 유지
  - 회귀 테스트 파일: `src/app/api/auth/signout/route.test.ts`
- 현재 auth 관련 보안 흐름은 callback 경로 강제, 서버 세션 종료, guest 병합 시 서버 상태 우선 규칙까지 포함해서 다시 확인된 상태다.

## 2026-03-28 Google 로그인 설정 / 아바타 렌더 메모

### 현재 구현 상태

- Google 로그인 버튼과 callback 교환 흐름은 이미 코드에 들어가 있음
  - `src/app/login/LoginPageClient.tsx`
  - `src/app/auth/callback/route.ts`
- 따라서 새 과제는 “구현”보다 아래 설정 연결로 봐야 함
  - Google Cloud OAuth client 생성
  - Supabase Dashboard `Authentication -> Providers -> Google`
  - Supabase `URL Configuration`

### 설정 시 반드시 맞춰야 할 값

- Google Cloud `Authorized JavaScript origins`
  - `http://localhost:3000`
  - 필요하면 `http://localhost:3001`
- Google Cloud `Authorized redirect URIs`
  - Supabase callback URL 그대로
  - 보통 `https://<project-ref>.supabase.co/auth/v1/callback`
- Supabase `Site URL`
  - 로컬 개발 기준 `http://localhost:3000`
- Supabase `Additional Redirect URLs`
  - `http://localhost:3000/**`
  - 필요하면 `http://localhost:3001/**`

### 런타임 후속 이슈

- Google 로그인 후 `/me` 페이지에서 프로필 이미지가 `lh3.googleusercontent.com`으로 내려오며 `next/image`가 런타임 에러를 냈음
- 이를 해결하려고 `next.config.ts`의 `images.remotePatterns`에 아래 호스트를 추가했음
  - `https://lh3.googleusercontent.com/**`
