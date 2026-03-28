# google avatar next/image host fix

- 작성시각: 2026-03-28 18:46 KST
- 해결하고자 한 문제:
  - Google 로그인 후 `/me` 페이지에서 프로필 이미지를 `next/image`로 렌더링할 때 `lh3.googleusercontent.com`이 허용 호스트에 없어 런타임 에러가 발생했음

## 해결된 것

- 원인을 `next/image` remote host 미등록으로 확인했음
- `next.config.ts`의 `images.remotePatterns`에 아래 호스트를 추가했음
  - `https://lh3.googleusercontent.com/**`

## 해결되지 않은 것

- 현재는 Google 프로필 이미지 호스트만 추가했음
- 이후 다른 소셜 로그인 provider 이미지 호스트가 필요하면 같은 방식으로 추가해야 함
