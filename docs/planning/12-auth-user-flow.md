# 로그인과 유저 페이지 구현 메모

- 작성시각: 2026-03-21 18:27 KST
- 기준: 현재 `auth`, `merge-local`, `/me`, Supabase persistence 구현

## 인증 기준

- 인증: Supabase Auth
- provider: Google, Kakao
- 세션: `@supabase/ssr` 기반 쿠키 세션
- 공개 페이지: `/login`
- 보호 페이지: `/me`, `/api/me/*`
- owner 계산: `auth user id -> guest cookie id`

## 현재 로그인 흐름

1. `/login` 진입
2. `signInWithOAuth`
3. `/auth/callback`에서 세션 교환
4. 서버가 `getInitialCurrentUserSnapshot()` 생성
5. `AppHeader`에 초기 상태 주입
6. 클라이언트 store가 첫 렌더를 이어받음
7. 이후 `GET /api/auth/session`로 실제 세션 확인 가능
8. `/me` 진입 시 `MergeLocalStateClient`가 local 상태를 1회 병합

## owner 규칙

- 로그인 상태:
  - Supabase auth user id를 owner로 사용
- 비로그인 상태:
  - guest cookie id를 owner로 사용
- 공통:
  - `getRequestOwnerId()`가 API owner 계산 담당

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

### `/api/battle/snapshot`

- guest, auth 모두 파일 저장 가능
- auth면 `battle_snapshots`도 upsert

### `/api/battle/session`

- auth만 `battle_sessions` 저장
- 비로그인은 `{ ok: false, skipped: "unauthenticated" }`

### `/api/battle/outcome`

- 파일 저장소에는 항상 기록
- auth면 outcome, decision seed, character memory까지 Supabase 미러 저장

메모:

- `persistAuthenticatedBattleSession()`은 `snapshotId`가 없으면 실질 저장을 건너뛴다.

## `/me` 구현 상태

- 비로그인이면 `/login?next=/me` redirect
- 서버 조회 항목:
  - `user_profiles`
  - `user_progress`
  - `battle_sessions`
  - 선택 battle의 `battle_outcomes`
  - 선택 battle의 `battle_snapshots`
  - 선택 battle의 `player_decision_seeds`
  - 선택 battle의 `character_memory_seeds`

즉 `/me`는 단순 프로필이 아니라 로그인 사용자 battle archive 진입점이다.

## local 레벨 규칙

- localStorage 키는 `ant_gravity_user_level:[userId]`
- `/result`에서 XP 반영은 `useUserLevelStore`가 처리
- `/me`는 서버 progress 기준으로 보여주되, 로그인 직후 merge 흐름으로 local 자산을 흡수한다

## 아직 남은 과제

1. guest -> auth 병합 성공 UX를 더 분명하게 보여주기
2. `/admin/*` 접근 제어 추가
3. `/me` 상세의 필터, 정렬, 상태 배지 개선
