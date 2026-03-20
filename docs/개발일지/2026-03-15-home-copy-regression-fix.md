# 홈 카피 깨짐 회귀 수정

- 작성시각: 2026-03-15 21:34:03 +09:00
- 해결하고자 한 문제:
  - 홈 화면 핵심 진입 영역 두 곳에서 한글 카피가 깨져 사용자 노출 품질이 무너진 상태였음.
  - 같은 회귀가 다시 발생하지 않도록 텍스트 검증 테스트가 필요했음.
- 진행 내용:
  - `src/presentation/components/TopCoinsGrid.tsx`의 문구를 원래 한국어 카피로 복구함.
  - `src/presentation/components/RecentCoinsList.tsx`의 제목, 설명, CTA 문구를 복구함.
  - `src/presentation/components/TopCoinsGrid.test.tsx`, `src/presentation/components/RecentCoinsList.test.tsx`를 추가해 카피와 링크를 검증함.
- 해결된 것:
  - 리뷰에서 지적된 P1 두 건을 모두 해소함.
  - `pnpm test -- src/presentation/components/TopCoinsGrid.test.tsx src/presentation/components/RecentCoinsList.test.tsx`, `pnpm lint`, `pnpm typecheck`를 통과함.
- 해결되지 않은 것:
  - 프로젝트 전체의 한글 인코딩/카피 이상 여부를 전수 점검하지는 않았음.

