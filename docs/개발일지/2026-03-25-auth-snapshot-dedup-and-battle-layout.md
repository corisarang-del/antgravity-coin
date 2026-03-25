# auth snapshot 중복 제거와 battle layout 헤더 공통화

- 작성시각: 2026-03-25 16:29 KST
- 해결하고자 한 문제:
  - `/me`가 같은 요청 안에서 `getInitialCurrentUserSnapshot()`와 `supabase.auth.getUser()`를 중복 실행하고 있었음.
  - `/battle/[coinId]`, `pick`, `waiting`, `result` 페이지가 step마다 header snapshot fetch를 반복하고 있었음.

## 진행 내용

- `src/infrastructure/auth/getInitialCurrentUserSnapshot.ts`
  - `createCurrentUserSnapshot()` 헬퍼를 분리함.
  - `getGuestUserId()`와 `createSupabaseServerClient()`를 병렬로 시작하도록 조정함.
- `src/app/me/page.tsx`
  - `getGuestUserId()`와 `createSupabaseServerClient()`만 먼저 받고,
  - 이미 가져온 `user`로 `createCurrentUserSnapshot()`을 만들어 header snapshot을 재사용하게 변경함.
- `src/app/battle/[coinId]/layout.tsx`
  - battle 공통 layout을 추가해서 `coinId`와 `initialCurrentUserSnapshot`을 한 번만 계산하고 `AppHeader`를 공통 렌더함.
- `src/app/battle/[coinId]/page.tsx`
  - page 자체는 battle 본문만 렌더하게 단순화함.
- `src/app/battle/[coinId]/pick/page.tsx`
  - page 자체는 pick 본문만 렌더하게 단순화함.
- `src/app/battle/[coinId]/waiting/page.tsx`
  - page 자체는 waiting 본문만 렌더하게 단순화함.
- `src/app/battle/[coinId]/result/page.tsx`
  - page 자체는 result 본문만 렌더하게 단순화함.

## 해결된 것

- `/me`의 auth snapshot 중복 계산 제거
- battle 하위 step 이동 시 header snapshot fetch 반복 제거
- `pnpm.cmd typecheck` 통과
- `pnpm.cmd lint` 통과
- `pnpm.cmd test` 통과

## 아직 안 된 것

- 이번 단계는 구조 중복 제거에 집중했고, 추가 UI 변경은 하지 않았음.
