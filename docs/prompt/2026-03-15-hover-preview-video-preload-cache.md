# 호버 프리뷰 비디오 preload/cache 구현

- 작성시각: 2026-03-15 22:57:57 +09:00
- 해결하고자 한 문제:
  - 캐릭터 카드 hover 시 mp4 프리뷰가 늦게 뜨거나 반복 hover에서 다시 로딩될 수 있었음.
  - 영상은 한 번 재생 후 멈추고, hover가 사라져도 캐시는 유지되길 원했음.
  - `design/character/*.mp4`를 실제 앱 경로에서도 바로 쓸 수 있어야 했음.
- 사용한 프롬프트/지시:
  - `loop` 제거, poster 우선, `loadeddata` 이후 비디오 전환, preload cache, pointerenter/pointerdown preload, hover 종료 후 캐시 유지 방식을 구현한다.
  - ffmpeg 최적화 파이프라인도 준비하되, 현재 환경에 ffmpeg가 없으면 복사 fallback을 둔다.
  - 테스트/린트/타입체크를 실행한다.
- 해결된 것:
  - `PreviewVideoCache`와 테스트를 추가해 hover 반복 시 캐시 재사용 구조를 구현함.
  - 랜딩 프리뷰가 hover 직전 preload되고, 준비 전에는 poster를 먼저 보여주며, 준비되면 비디오를 1회 재생 후 마지막 프레임에 멈추게 구성함.
  - `pointerenter`, `pointerdown`, `focus`에서 preload가 시작되도록 반영함.
  - `scripts/prepare-preview-videos.ps1`와 `pnpm videos:prepare`를 추가하고, 현재 mp4들을 `public/characters/previews`로 준비함.
- 해결되지 않은 것:
  - 현재 작업 환경에는 `ffmpeg`가 없어서 mp4를 실제로 재인코딩하지는 못했고, raw 파일 복사 fallback으로만 준비함.
  - `ledger.mp4`는 소스 폴더에 없어 poster fallback만 동작함.
