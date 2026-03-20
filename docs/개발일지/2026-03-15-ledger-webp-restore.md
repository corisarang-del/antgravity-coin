# ledger webp 복구

- 작성시각: 2026-03-15 16:40 KST
- 해결하고자 한 문제:
  - 실수로 삭제한 `ledger.webp`를 `ledger.png` 기준으로 다시 복구해야 했음
- 해결된 것:
  - `public/characters/ledger.png`를 `public/characters/ledger.webp`로 다시 변환함
  - `pnpm lint`, `pnpm typecheck` 통과
- 해결되지 않은 것:
  - 없음

