# event log 지연 fetch와 character card sizes 재조정

- 작성시각: 2026-03-18 21:01 KST
- 해결하고자 한 문제:
  - admin `Event Log`가 lazy chunk처럼 보여도 실제로는 초기에 이미 fetch되고 직렬화되고 있었다.
  - `/characters` 카드 이미지 `sizes`가 실제 카드 폭보다 크게 잡혀 과한 이미지가 내려올 수 있었다.

## 해결된 것
- `AdminBattleEventLog`를 서버 컴포넌트로 바꾸고 `battleId` 기준으로 내부에서 직접 지연 fetch 하도록 수정했다.
- `AdminBattleDetailPanel`에서는 `Suspense` fallback으로 감싸서 `Event Log`만 별도 지연 렌더 경계가 생기게 했다.
- admin 상세 타입에서 `events`를 분리해 초기 상세 payload를 줄였다.
- `/characters` 카드 `sizes`를 1열/2열 실제 폭 기준으로 `31.5rem` 상한과 중간 계산식으로 재조정했다.
- 첫 줄 카드 2장만 `priority`를 유지하도록 정리했다.
- `pnpm lint`, `pnpm typecheck`를 통과했다.

## 아직 해결 안 된 것
- 브라우저 실측 네트워크 프로파일까지는 아직 보지 않았다.
- `Event Log` 항목이 아주 많을 때 가상화까지 적용하지는 않았다.

