# google avatar next/image host fix

- 작성시각: 2026-03-28 18:46 KST
- 프롬프트:
  - `Google 로그인 후 /me 페이지에서 next/image hostname not configured 오류 수정`
- 해결하고자 한 문제:
  - Google 프로필 이미지 URL이 `lh3.googleusercontent.com`에서 내려오는데 `next/image` 허용 호스트에 빠져 있어 `/me` 페이지가 런타임 에러로 깨지는 문제를 해결하는 것
- 해결된 것:
  - `next.config.ts`의 `images.remotePatterns`에 `https://lh3.googleusercontent.com/**` 추가
- 해결되지 않은 것:
  - 다른 OAuth provider가 별도 이미지 호스트를 쓰면 추가 허용이 더 필요할 수 있음
