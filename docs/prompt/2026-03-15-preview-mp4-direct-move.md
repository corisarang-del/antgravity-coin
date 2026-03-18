# 프리뷰 mp4 직접 이동 정리

- 작성시각: 2026-03-15 23:00:04 +09:00
- 해결하고자 한 문제:
  - 프리뷰 mp4를 `design/character`에서 관리하는 대신 실제 서비스 경로인 `public/characters/previews`로 직접 두고 싶었음.
  - 별도 준비 스크립트는 불필요하다는 요청이 있었음.
- 사용한 프롬프트/지시:
  - `character` 폴더 안의 mp4 파일들을 `public/characters/previews`로 직접 옮긴다.
  - 준비용 스크립트와 package.json 스크립트는 제거한다.
- 해결된 것:
  - `design/character/*.mp4`를 `public/characters/previews/*.mp4`로 직접 이동함.
  - `videos:prepare` npm 스크립트를 제거함.
  - `scripts/prepare-preview-videos.ps1`를 삭제함.
- 해결되지 않은 것:
  - 없음.
