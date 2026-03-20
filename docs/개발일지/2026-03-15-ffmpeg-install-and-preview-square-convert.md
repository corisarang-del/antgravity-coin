# ffmpeg 설치와 프리뷰 mp4 정사각 변환

- 작성시각: 2026-03-15 23:07:41 +09:00
- 해결하고자 한 문제:
  - 프리뷰 호버 비디오가 프레임 안에서 꽉 차 보이지 않았고, raw mp4 용량도 큰 편이었음.
  - ffmpeg를 실제로 설치해서 변환 파이프라인을 적용할 필요가 있었음.
- 진행 내용:
  - ffmpeg Windows 빌드를 내려받아 `tools/ffmpeg`에 설치함.
  - `public/characters/previews`의 mp4 8개를 모두 720x720 정사각 패딩 + `-an` + `libx264` + `crf 28` + `yuv420p` + `+faststart` 기준으로 변환함.
  - 랜딩 프리뷰 비디오 렌더링 클래스를 `object-cover`로 변경함.
- 해결된 것:
  - 프리뷰 mp4가 정사각 프레임 기준 자산으로 바뀌어서 호버 박스를 더 안정적으로 채우게 됨.
  - mp4 용량이 크게 줄어 preload/cache에 유리해짐.
  - `pnpm lint`, `pnpm typecheck`를 통과함.
- 해결되지 않은 것:
  - 없음.

