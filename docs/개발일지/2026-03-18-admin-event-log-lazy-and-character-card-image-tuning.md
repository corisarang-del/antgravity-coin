# admin event log lazy 분리와 character card 이미지 튜닝

- 작성시각: 2026-03-18 20:55 KST
- 해결하고자 한 문제:
  - admin 상세 내부에서도 특히 긴 `Event Log` 블록을 별도 lazy chunk로 더 쪼개고 싶었다.
  - `/characters` 화면에서 카드 썸네일의 `sizes`, `priority`를 실제 레이아웃 폭 기준으로 더 맞추고 싶었다.

## 해결된 것
- `AdminBattleEventLog`를 별도 컴포넌트로 분리하고 `AdminBattleDetailPanel` 안에서 동적 import로 불러오도록 바꿨다.
- `CharacterCard`에 `imagePriority`, `imageSizes` props를 추가해 카드별 이미지 로딩 전략을 조절할 수 있게 했다.
- `/characters` 화면에서는 첫 줄 카드 2장만 `priority`를 주고, 1열/2열 레이아웃 기준 `sizes`를 명시했다.
- `pnpm lint`, `pnpm typecheck`를 통과했다.

## 아직 해결 안 된 것
- `Event Log` 내부 항목 수가 아주 많을 때 가상화까지 적용하지는 않았다.
- `/characters`에 대한 실제 브라우저 네트워크 프로파일링까지는 이번 턴에서 수행하지 않았다.
