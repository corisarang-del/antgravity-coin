# 개발일지 - 프로젝트 부트스트랩 및 홈 화면 MVP 구현

작성시각: 2026-03-14 14:48 KST

## 해결하려던 문제

- 현재 프로젝트를 실제 실행 가능한 앱으로 바꾸고
- 기획 문서와 `design/MASTER.md` 규칙을 반영한 홈 화면 MVP를 구현하려고 했다

## 진행 내용

- 임시 Next.js 앱을 생성해 필요한 설정을 참고했다
- 루트 기준으로 Next.js 16 + React 19 + Tailwind 4 + TypeScript + Vitest 구성을 만들었다
- 기존 `src/styles/tokens.css`를 앱 전역 스타일과 연결했다
- 홈 화면에 헤더, 검색 영역, Top 코인 카드, 최근 본 코인, 리스크 고지를 구현했다
- `characters`, `battle/[coinId]`, `battle/[coinId]/pick` 플레이스홀더 라우트도 만들었다
- `RiskDisclaimer` 테스트를 추가했다

## 해결된 것

- 앱이 실제로 빌드되고 실행 가능한 상태가 됐다
- 디자인 규칙 기반의 홈 화면 MVP가 생겼다
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`가 모두 통과했다
- `.env.local.example`을 추가했다

## 아직 안 된 것

- 실제 CoinGecko 검색 API 연동
- 로컬스토리지 기반 최근 검색 저장
- SSE 배틀 스트림
- 결과 화면과 레벨 시스템

## 메모

- 임시 생성한 `bootstrap-app` 폴더는 참고용으로 남아 있다
- `next build`가 `tsconfig.json`의 JSX 설정을 `react-jsx`로 자동 조정했다
