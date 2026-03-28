# Next allowedDevOrigins 경고 대응

- 작성시각: 2026-03-28 22:13 KST

## 해결하고자 한 문제

- dev 환경에서 `172.25.224.1` origin이 `/_next/*` 리소스를 요청하면서 Next.js의 cross-origin dev 경고가 뜨고 있었음
- 향후 Next.js 메이저 버전에서 기본 차단될 예정이라 미리 `allowedDevOrigins`를 설정할 필요가 있었음

## 해결된 것

- `next.config.ts`에 `allowedDevOrigins: ["172.25.224.1"]`를 추가했음
- 현재 경고에 찍힌 dev origin 기준으로 Next가 허용 대상을 명시적으로 알 수 있게 맞췄음
- `pnpm.cmd build`로 설정 반영 후 빌드가 깨지지 않는지 확인할 예정임

## 아직 안 된 것

- 다른 추가 dev origin이 더 있다면 그건 별도로 더 넣어야 함
