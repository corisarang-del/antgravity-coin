# Judy 파비콘 변경

- 작성시각: 2026-03-27 18:05 KST
- 해결하고자 한 문제:
  - 현재 사이트 파비콘이 `public/icon.png`를 가리키고 있어서, 요청한 `design/character/judy.webp`를 실제 파비콘으로 연결할 필요가 있었음

## 해결된 것

- `design/character/judy.webp`를 `public/icon.webp`로 복사했음
- `src/app/layout.tsx`의 metadata icons 경로를 `/icon.webp`로 변경했음
- 기존 `icon.png`는 남겨두고 실제 참조만 바꿔서 롤백이 쉬운 상태로 유지했음

## 해결되지 않은 것

- 이번 작업은 파비콘 연결 변경까지만 했고, 배포 반영 여부나 브라우저 캐시로 인한 즉시 반영 확인은 아직 안 했음
