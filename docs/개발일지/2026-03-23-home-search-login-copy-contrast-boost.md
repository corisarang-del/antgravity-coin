# 홈 검색 로그인 설명문 대비 강화

- 작성시각: 2026-03-23 22:39 KST
- 해결하고자 한 문제:
  - `Pretendard`와 `16px` 적용 뒤에도 홈, 검색, 로그인 화면 설명문이 아직 조금 연하게 느껴졌음
  - 전역 muted 색을 바꾸지 않고 해당 세 화면 설명문만 한 단계 더 또렷하게 만들 필요가 있었음

## 해결된 것

- `src/app/globals.css`에 `.ag-body-copy-strong` 클래스를 추가했음
- 이 클래스는 전역 토큰 변경 없이 `foreground` 기반의 조금 더 진한 대비를 적용함
- 아래 화면 설명문에만 선택적으로 적용했음
  - `src/app/home/page.tsx`
  - `src/presentation/components/SearchBar.tsx`
  - `src/app/login/LoginPageClient.tsx`
- 검증
  - `pnpm.cmd typecheck` 통과
  - 대상 파일 `eslint` 통과

## 해결되지 않은 것

- 실제 브라우저에서 시각적 강도가 과한지 여부는 이번 턴에서 따로 확인하지 않았음
- waiting / pick / result 등 다른 화면 설명문 대비는 이번 범위에서 변경하지 않았음
