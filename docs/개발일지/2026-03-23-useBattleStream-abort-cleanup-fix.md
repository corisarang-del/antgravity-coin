# useBattleStream abort cleanup fix

- 작성시각: 2026-03-23 17:04 KST
- 해결하고자 한 문제:
  - `useBattleStream` cleanup에서 `controller.abort()`가 호출될 때 `BodyStreamBuffer was aborted` 에러가 noisy하게 보이는 문제를 줄여야 했음
  - battle 화면을 벗어날 때 정상 cleanup이 예외처럼 보이는 사용자 경험을 막아야 했음

## 해결된 것

- `src/presentation/hooks/useBattleStream.ts`
  - 스트림 reader가 이미 열린 뒤에는 `AbortController` 대신 `reader.cancel()`로만 정리하도록 변경했음
  - 아직 response body reader가 생기기 전 단계에서만 `controller.abort()`를 호출하도록 분기했음
- `src/presentation/hooks/useBattleStream.test.tsx`
  - unmount 시 `reader.cancel()`은 호출되고 `abort()`는 호출되지 않는 cleanup 테스트를 추가했음
- 검증
  - `pnpm run typecheck` 통과
  - 추가한 `useBattleStream` 테스트 자체는 통과 확인

## 해결되지 않은 것

- Vitest 실행 시 `tmp/automation-prewarm.live.test.ts` 같은 기존 tmp 테스트 파일도 함께 잡혀 전체 명령은 별도 이유로 실패 표시가 남음
- 실제 브라우저에서 battle 화면 이동까지 다시 확인하는 단계는 이번 턴에서 수행하지 않았음
