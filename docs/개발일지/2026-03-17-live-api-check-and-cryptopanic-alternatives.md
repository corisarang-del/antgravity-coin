# 실데이터 라이브 체크와 CryptoPanic 대체안 정리

- 작성시각: 2026-03-17 17:18 KST
- 해결하고자 한 문제:
  - `CryptoPanic` 대체 수단을 생각해보고, 현재 외부 데이터 소스들이 실제 값을 받는지 확인 가능한 라이브 테스트가 필요했다.

## 해결된 것

- `src/infrastructure/api/liveApiSources.live.test.ts`를 추가해서
  - CoinGecko
  - Alternative.me
  - Bybit
  - Hyperliquid
  - CryptoPanic(키가 있을 때만)
  의 실데이터 확인 테스트를 만들었다.
- `package.json`에 `pnpm test:live-apis` 스크립트를 추가했다.
- `docs/planning/08-character-debate-reference.md`에 CryptoPanic 대체안으로 `Alpha Vantage`, `GDELT`, `NewsAPI`를 정리했다.
- `docs/planning/05-api-spec.md`에도 대체 후보를 명시했다.

## 아직 안 된 것

- 현재 `.env.local`에서 `CRYPTOPANIC_API_KEY`가 비어 있어서 라이브 CryptoPanic 테스트는 자동 skip 대상이다.
- 대체안은 문서화만 했고, 아직 실제 코드 전환은 하지 않았다.
