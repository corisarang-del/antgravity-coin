# Next allowedDevOrigins 경고 대응 프롬프트

- 작성시각: 2026-03-28 22:13 KST

## 프롬프트 요약

- ⚠ Cross origin request detected from 172.25.224.1 to /_next/* resource. In a future major version of Next.js, you will need to explicitly configure "allowedDevOrigins" in next.config to allow this.

## 해결하고자 한 문제

- Next.js dev cross-origin 경고를 실제 origin 기준으로 미리 설정해서 이후 차단 이슈를 막는 것

## 해결된 것

- `next.config.ts`에 `allowedDevOrigins`를 추가하는 방향으로 반영했음

## 아직 안 된 것

- 추가적인 dev origin 사용 여부는 실제 개발 환경에 따라 더 확인이 필요함
