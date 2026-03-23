# Pretendard body 폰트 전환과 16px 설명문 가독성 개선

- 작성시각: 2026-03-23 22:34 KST
- 해결하고자 한 문제:
  - body 폰트가 `Plus Jakarta Sans` 중심이라 한글 설명문 가독성이 아쉽고 작게 느껴졌음
  - 전역 전체를 키우지 않으면서, 실제로 읽기 불편한 설명문과 보조 카피만 `16px`로 올릴 필요가 있었음

## 해결된 것

- `src/app/layout.tsx`
  - body용 `Plus_Jakarta_Sans` Google font import를 제거했음
  - `Space_Grotesk` display 폰트만 유지했음
- `src/app/globals.css`
  - `--font-body`를 `Pretendard`, `Noto Sans KR`, `Segoe UI`, `sans-serif` 순으로 재정의했음
  - 공통 설명문 클래스 `.ag-body-copy`를 추가해서 `16px`, 넉넉한 줄간격, 약한 자간 조정 규칙을 만들었음
- 아래 화면과 컴포넌트의 설명문/보조 카피에 `.ag-body-copy`를 적용했음
  - 홈 상단 소개와 추천 코인 설명
  - 검색바 설명문, 하단 보조문, 빈 결과/초기 안내
  - 로그인 본문 설명과 상태 안내
  - waiting / pick / result 페이지의 본문 설명
  - `RiskDisclaimer`, `CountdownTimer`, `TeamSummaryCard`
- 검증
  - `pnpm.cmd typecheck` 통과
  - 대상 파일 `eslint` 통과
  - `src/app/globals.css`는 현재 eslint 설정상 검사 대상이 아니라 ignored warning만 확인됨

## 해결되지 않은 것

- 실제 브라우저에서 모바일/데스크톱 시각 밸런스 확인은 이번 턴에서 따로 하지 않았음
- 헤더 보조 라벨, `text-xs` 메타 정보, CTA 타이포는 이번 범위에서 바꾸지 않았음
