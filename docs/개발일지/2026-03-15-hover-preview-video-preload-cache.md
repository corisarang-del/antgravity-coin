# 호버 프리뷰 비디오 preload/cache 구현

- 작성시각: 2026-03-15 22:57:57 +09:00
- 해결하고자 한 문제:
  - 랜딩 캐릭터 프리뷰 비디오가 첫 hover에서 늦게 뜰 수 있었고, 반복 hover에서도 즉시성이 보장되지 않았음.
  - 영상이 반복 재생되는 대신 1회 재생 후 정지해야 했음.
- 진행 내용:
  - `src/app/previewVideoCache.ts`, `src/app/previewVideoCache.test.ts`를 추가해 비디오 preload/cache 로직을 분리함.
  - `src/app/LandingPageClient.tsx`에서 hover 프리뷰를 poster 우선 + cache 기반 비디오 전환 구조로 변경함.
  - 카드에 `pointerenter`, `pointerdown`, `focus` preload를 추가하고, idle 시 첫 두 캐릭터를 미리 prewarm하도록 구성함.
  - `scripts/prepare-preview-videos.ps1`, `package.json`의 `videos:prepare` 스크립트를 추가함.
  - `design/character/*.mp4`를 `public/characters/previews/*.mp4`로 준비함.
- 해결된 것:
  - hover 종료 후 UI만 닫히고 캐시는 유지돼 반복 hover에서 다시 재사용됨.
  - 비디오는 `loop` 없이 한 번 재생 후 마지막 프레임에서 멈추는 구조가 반영됨.
  - `pnpm test`, `pnpm lint`, `pnpm typecheck`를 통과함.
- 해결되지 않은 것:
  - `ffmpeg` 부재로 실제 1~2MB 재인코딩은 못 했고, 설치 후 `pnpm videos:prepare`를 다시 실행해야 최적화가 적용됨.
