# memory와 관련 문서 업데이트 후 커밋 준비

- 작성시각: 2026-03-28 19:10 KST
- 해결하고자 한 문제:
  - 이번 세션에서 실제로 정리된 의존성 복구와 Google 로그인 후속 내용을 다음 세션에서 잃지 않도록 `memory.md`와 관련 문서에 추가 기록할 필요가 있었음

## 해결된 것

- `memory.md`에 아래 내용을 추가 기록했음
  - 기존 store 손상으로 인한 모듈 누락 연쇄
  - `.pnpm-store-clean` 기반 fresh install
  - `pnpm build` 통과
  - `next dev` ready 확인
  - Google 로그인 구현 상태와 avatar host 허용 이슈
- `research.md`에 이번 세션의 복구 흐름과 auth 후속 판단을 추가했음
- auth/security 관련 문서에도 아래를 추가했음
  - Google Cloud / Supabase 설정 포인트
  - `lh3.googleusercontent.com` 허용 메모
  - social login 체크리스트 보강

## 해결되지 않은 것

- 기존 워크트리가 매우 더럽기 때문에 커밋 시 unrelated 파일을 섞지 않도록 staging 범위를 별도로 정리해야 함
- lint / typecheck / build 검증 결과를 다시 확인한 뒤에만 최종 커밋/푸시하는 게 안전함
