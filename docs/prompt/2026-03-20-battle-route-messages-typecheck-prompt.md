# Battle Route Messages Typecheck Prompt

- 작성시각: 2026-03-20 23:10 KST
- 프롬프트 내용 간단 요약:
  - `src/app/api/battle/route.ts`의 `const messages = [];` 타입 문제부터 잡고
  - `typecheck -> lint -> test` 순서로 검증

## 해결된 것
- `messages` 타입을 명시하는 최소 수정 방향을 적용함
- 요청한 검증 순서대로 실행할 준비를 마침

## 해결되지 않은 것
- 검증 결과에서 드러나는 기존 실패가 있으면 추가 정리 필요

