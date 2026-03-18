# 프리뷰 오디오 복구와 비디오 비율 복원

- 작성시각: 2026-03-15 23:15:08 +09:00
- 해결하고자 한 문제:
  - 정사각 패딩 변환 때문에 프리뷰 상하 검은 여백이 생겼음.
  - 원본 mp4를 다시 넣은 뒤 오디오를 살린 재변환이 필요했음.
- 진행 내용:
  - `tools/ffmpeg/bin/ffprobe.exe`로 원본 `design/character/*.mp4`에 `aac` 오디오가 살아있는 걸 확인함.
  - `tools/ffmpeg/bin/ffmpeg.exe`로 원본 mp4를 `scale=720:-2`, `libx264`, `aac`, `+faststart` 기준으로 다시 변환함.
  - 결과물을 `public/characters/previews/*.mp4`에 덮어씀.
  - `src/app/LandingPageClient.tsx`는 프리뷰 비디오를 `aspect-[20/11]`와 `object-cover` 기준으로 유지함.
- 해결된 것:
  - 프리뷰 파일들에 오디오 트랙이 다시 포함됨.
  - 상하 검은 배경 원인이던 정사각 패딩 변환은 제거됨.
  - `pnpm lint`, `pnpm typecheck`를 통과함.
- 해결되지 않은 것:
  - hover에서 사운드는 브라우저 정책상 첫 클릭/터치 이후에만 안정적으로 재생될 수 있음.
