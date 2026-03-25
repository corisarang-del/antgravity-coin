# Vercel React 성능 리뷰 지적사항 반영

- 작성시각: 2026-03-25 15:45 KST
- 해결하고자 한 문제:
  - 리뷰에서 나온 4개 성능 이슈를 실제 코드에 반영해야 했음.
  - 대상 이슈는 `useBattleStream` 리렌더, `SearchBar` 중복 fetch, `AppHeader` 공통 번들 비용, `/me` 상세 과다 조회였음.

## 진행 내용

- `src/presentation/hooks/useBattleStream.ts`
  - timing metrics를 모든 이벤트마다 state로 올리지 않고, 실제 UI에 필요한 시점에만 state 동기화하도록 조정함.
- `src/presentation/components/SearchBar.tsx`
  - 검색 effect에서 `isOpen` 의존성을 제거하고, 같은 검색어로 blur/focus 할 때 중복 요청이 다시 나가지 않게 정리함.
- `src/presentation/components/AppHeader.tsx`
  - 헤더를 서버 셸로 바꾸고, 로그인 상태 pill과 로그아웃 버튼만 `AppHeaderAuthControls.tsx` 클라이언트 아일랜드로 분리함.
- `src/app/home/page.tsx`
  - 서버 헤더 사용으로 전환함.
- `src/app/characters/page.tsx`
  - 서버 헤더 사용으로 전환함.
- `src/app/me/page.tsx`
  - 서버 헤더 사용으로 전환함.
  - `selectedBattle` 조회 projection을 실제 사용하는 컬럼 위주로 축소함.
- `src/app/battle/[coinId]/*`
  - battle, pick, waiting, result 서버 page에서 헤더를 렌더하고, 각 client page는 헤더 prop 없이 본문만 맡도록 정리함.

## 해결된 것

- 배틀 스트림 중 비가시 메트릭 업데이트 때문에 전체 화면이 흔들리던 비용을 줄였음.
- 검색창의 동일 쿼리 재요청을 줄였음.
- 공통 헤더의 클라이언트 번들 범위를 auth controls 쪽으로 축소했음.
- `/me` 상세 조회에서 과다 projection을 줄였음.
- `pnpm.cmd typecheck` 통과.
- 대상 파일 `eslint` 통과.

## 아직 안 된 것

- 전체 `pnpm.cmd lint`는 기존 `tmp/` 산출물의 `require()` 오류 때문에 계속 실패함.
- 이번 변경을 커버하는 별도 테스트는 추가하지 않았고, 구조 변경 위주라 타입체크와 대상 lint로 검증했음.
