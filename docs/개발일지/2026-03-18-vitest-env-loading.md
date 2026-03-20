# Vitest env 로딩 연결

- 작성시각: 2026-03-18 19:27 KST
- 해결하고자 한 문제:
  - `.env.local`에 `ALPHA_VANTAGE_API_KEY`를 넣었는데, Vitest 라이브 테스트가 그 값을 자동으로 읽지 못해 `Alpha Vantage` 테스트가 skip되고 있었다.

## 해결된 것

- `vitest.config.ts`에서 `loadEnv`를 사용해 Vitest 실행 시 `.env.local` 값을 `process.env`에 병합하도록 연결했다.
- 이제 라이브 테스트가 일반 앱 실행 환경과 같은 방식으로 로컬 키를 읽을 수 있다.

## 아직 안 된 것

- `NewsAPI` 키는 아직 비어 있어서 관련 라이브 테스트는 계속 skip 대상이다.

