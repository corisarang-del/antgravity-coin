# 개발일지 - Phase 2 홈 화면 구현

작성시각: 2026-03-14 14:54 KST

## 해결하려던 문제

- Phase 2 기준으로 코인 검색 API, 홈 화면 자동완성, 최근 검색 저장, Top 코인 로딩을 구현하려고 했다

## 진행 내용

- CoinGecko API 클라이언트와 저장소 계층을 추가했다
- `/api/coins/search`, `/api/coins/top` 라우트를 만들었다
- 검색바를 디바운스 기반 자동완성 구조로 바꿨다
- 최근 검색을 로컬스토리지에 저장하는 `useRecentCoins` 훅을 만들었다
- 홈 화면을 서버 데이터 기반으로 바꾸고 RecentCoinsList를 실데이터 훅 연결 구조로 수정했다
- `SearchBar` 자동완성 테스트를 추가했다

## 해결된 것

- 홈 화면 검색 자동완성이 동작하는 구조가 생겼다
- CoinGecko 요청 실패 시 목데이터로 폴백하도록 처리했다
- 최근 검색 5개 저장/표시 구조가 생겼다
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`를 모두 통과했다

## 아직 안 된 것

- 실제 CoinGecko API 응답을 쓰는 E2E 검증
- Top 코인 카드 클릭 시 최근 검색 자동 반영
- `/battle/[coinId]` 이후 스트리밍 토론 연결

## 메모

- 테스트 안정성을 위해 SearchBar에 `debounceMs` 주입 포인트를 추가했다
- 기본값은 300ms라 실제 동작은 기존 요구사항과 같다

