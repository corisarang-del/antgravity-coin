# 개발일지 - 토큰 연결과 프리뷰 하네스 생성

작성시각: 2026-03-14 14:43 KST

## 해결하려던 문제

- 토큰을 실제 전역 스타일에 연결하고
- Button, Card, Badge, Input 샘플을 적용하고
- light/dark 비교가 가능한 프리뷰 화면을 만들려고 했다

## 진행 내용

- `src/styles/globals.css`를 만들고 `tokens.css`를 import했다
- 샘플 컴포넌트 스타일을 공용 클래스 기준으로 정의했다
- `design-system-preview.html`을 만들어 light/dark 토글과 샘플 UI를 넣었다

## 해결된 것

- 토큰 연결용 전역 스타일이 생겼다
- 샘플 컴포넌트 미리보기가 가능해졌다
- 라이트/다크 비교 하네스를 만들었다

## 아직 안 된 것

- 실제 앱 엔트리 import
- Playwright 기반 시각 검증
- `pnpm lint`, `pnpm typecheck`

## 메모

- 현재 저장소에는 앱 엔트리 파일이 없어 `globals.css`를 준비 파일로 생성했다
