# event log 페이지네이션과 character priority 실측 비교

- 작성시각: 2026-03-18 21:10 KST
- 해결하고자 한 문제:
  - `/characters`에서 `priority 2장`과 `4장`을 실제 브라우저 기준으로 비교해 더 나은 쪽을 결정하고 싶었다.
  - admin `Event Log`가 길어질 때도 초기 렌더 비용이 급격히 커지지 않도록 페이지네이션을 넣고 싶었다.

## 해결된 것
- Playwright로 `/characters`를 실제 브라우저에서 확인한 결과, 카드 폭은 약 `485px`였고 `priority 2장`과 `4장` 모두 실제 선택된 이미지 후보는 `w=1080`으로 같았다.
- `priority 4장`은 이미지 폭 이득 없이 eager 로딩 범위만 넓혀서 최종적으로 `priority 2장`을 유지했다.
- `Event Log`는 `battleId + eventPage` 기준으로 서버에서 페이지네이션되도록 바꿨다.
- `Event Log` 0건일 때 범위 표시도 `0-0`으로 자연스럽게 처리했다.
- `pnpm lint`, `pnpm typecheck`를 통과했다.

## 아직 해결 안 된 것
- 실제 네트워크 waterfall/LCP 비교까지는 별도 보고서 형태로 정리하지 않았다.
- Event Log 가상화는 아직 적용하지 않았고, 현재는 페이지네이션만 추가한 상태다.
