# ledger 이미지 webp 교체와 설명 갱신

- 작성시각: 2026-03-15 15:16 KST
- 해결하고자 한 문제:
  - ledger 캐릭터를 사용자가 지정한 새 원본 이미지로 전부 교체해야 했음
  - png를 직접 쓰는 게 아니라 webp로 변환한 뒤 기존 배포 경로를 유지해야 했음
  - 캐릭터도감 설명도 새 이미지 분위기에 맞춰 바꾸고 싶었음
- 해결된 것:
  - 지정한 PNG를 `public/characters/ledger.webp`로 변환해 기존 서비스 경로를 유지한 채 교체함
  - `catalog.ts`를 UTF-8 기준으로 정리하면서 ledger의 원본 이미지명, 성격, 선정 이유를 새 이미지에 맞게 갱신함
  - 관련 상수 테스트를 새 ledger 원본 이미지 기준으로 갱신함
  - `pnpm lint`, `pnpm typecheck`, `pnpm test -- characters` 통과
- 해결되지 않은 것:
  - 없음
