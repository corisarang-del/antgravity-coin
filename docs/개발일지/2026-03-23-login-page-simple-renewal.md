# 로그인 페이지 심플 리뉴얼

- 작성시각: 2026-03-23 22:12 KST
- 해결하고자 한 문제:
  - 로그인 페이지에 텍스트와 정보 블록이 너무 많아서 첫 진입 시 핵심 행동이 흐려졌음
  - 현재 디자인 언어는 유지하면서 더 짧고 직관적인 로그인 화면으로 줄일 필요가 있었음

## 해결된 것

- `src/app/login/LoginPageClient.tsx`에서 소개 문구와 정보 카드 수를 크게 줄였음
- 왼쪽 영역은 한 줄 메시지, 짧은 보조 설명, 핵심 benefit pill만 남기는 구조로 단순화했음
- 오른쪽 영역은 OAuth 선택 카드 중심으로 정리하고 하단 설명도 한 줄 요약으로 축소했음
- `src/app/login/LoginPageClient.test.tsx`도 바뀐 버튼 라벨과 에러 문구에 맞춰 갱신했음
- 검증
  - `pnpm.cmd typecheck` 통과
  - `node_modules\.bin\eslint.cmd src/app/login/LoginPageClient.tsx src/app/login/LoginPageClient.test.tsx` 통과

## 해결되지 않은 것

- `node_modules\.bin\vitest.cmd run src/app/login/LoginPageClient.test.tsx`는 이 환경에서 `spawn EPERM`으로 실행되지 않았음
- 실제 브라우저에서 최종 시각 검수는 이번 턴에서 따로 수행하지 않았음
