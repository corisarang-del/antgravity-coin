이 폴더는 `/characters`, 랜딩 캐릭터 미리보기, 배틀 화면 썸네일에서 직접 사용하는 배포용 캐릭터 이미지를 둬.

현재 사용 중인 파일:

- `aira.webp`
- `judy.webp`
- `clover.webp`
- `blaze.webp`
- `ledger.webp`
- `shade.webp`
- `vela.webp`
- `flip.webp`

운영 규칙:

- 캐릭터 내용 수정은 `src/features/characters/catalog.ts` 한 파일에서 해.
- API 응답 형태는 `src/features/characters/api.ts`에서 관리해.
- 데이터 소스 스위칭은 `.env.local`의 `CHARACTERS_SOURCE` (`local` 또는 `external`)로 해.
- 외부 API를 쓸 때는 `CHARACTERS_API_URL`도 같이 넣어.
- 브라우저 캐시 문제를 막기 위해 화면에서 쓰는 이미지 URL에는 `?v=` 버전 토큰이 자동으로 붙어.
- 원본 PNG와 역할 선정 이유는 `design/character/character-role.md`에서 확인해.
