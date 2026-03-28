# fresh store 재설치와 Next dev 복구

- 작성시각: 2026-03-28 18:40 KST
- 프롬프트:
  - `next dev` 실행 시 반복되는 모듈 누락, lock 충돌, spawn EPERM 문제를 함께 복구
- 해결하고자 한 문제:
  - 기존 pnpm store를 반복 재사용하면서 `react`, `zod`, `scheduler`, `@supabase/ssr` 같은 핵심 패키지가 부분 손상된 상태로 설치되고 있었고, 그 결과 `next dev`, `next build`가 연쇄적으로 실패하던 문제를 끝까지 정리하는 것
- 해결된 것:
  - 새 로컬 store `.pnpm-store-clean`으로 강제 재설치
  - sandbox 밖 설치로 postinstall `spawn EPERM` 우회
  - `react`, `react-dom`, `zod`, `scheduler`, `@supabase/ssr` resolve 정상 확인
  - `pnpm build` 통과 확인
  - `next dev` 로그 기준 `Ready in 1039ms` 확인
  - 검증용으로 띄운 dev 프로세스 정리
- 해결되지 않은 것:
  - `pnpm run dev` 실행 시 포트 번호까지 사용자 터미널 기준으로 다시 확인하진 않음
  - 기존에 떠 있던 오래된 다른 `node` 프로세스 전부를 정리하지는 않음
