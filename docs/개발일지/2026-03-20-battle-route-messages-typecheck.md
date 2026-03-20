# Battle Route Messages Typecheck

- 작성시각: 2026-03-20 23:10 KST
- 해결하고자 한 문제:
  - `src/app/api/battle/route.ts`의 `const messages = [];`가 타입 추론에 기대고 있어 `pnpm typecheck`에서 implicit `any[]` 또는 관련 타입 오류가 날 수 있는 상태였음
  - 배틀 스트림 라우트 수정 후 `typecheck -> lint -> test` 순서로 바로 검증할 필요가 있었음

## 해결된 것
- `messages`를 `DebateMessage[]`로 명시해서 `generateCharacterMessage()` 호출 시그니처와 타입을 맞춤
- 검증 순서대로 `pnpm typecheck`, `pnpm lint`, `pnpm test`를 실행해 결과를 확인함

## 해결되지 않은 것
- 검증 과정에서 이번 수정과 무관한 기존 오류가 있으면 별도로 정리 필요

