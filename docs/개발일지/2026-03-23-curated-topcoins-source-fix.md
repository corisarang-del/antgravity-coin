# 추천 코인 curated 소스 경로 수정

- 작성시각: 2026-03-23 23:18 KST
- 해결하고자 한 문제:
  - `mockCoins.ts`에서 `AVAX`로 바꿨는데도 홈 추천 코인 목록에 여전히 의도하지 않은 코인이 보였음
  - 원인은 홈 추천 코인 목록이 fallback 상수만 쓰는 게 아니라 CoinGecko 성공 응답의 top markets를 그대로 사용하고 있었기 때문이었음

## 해결된 것

- `src/infrastructure/db/coinGeckoRepository.ts`
  - `fetchTopCoins()`가 더 이상 CoinGecko의 market cap 상위 10개를 그대로 반환하지 않게 수정했음
  - 현재 `topCoins` 상수에 정의한 curated id 목록만 `ids=` 쿼리로 조회하도록 바꿨음
  - live 응답이 있으면 가격, 변동률, 시총만 실데이터로 덮고
  - 순서, 코인 구성, thesis, thumb는 curated 목록 기준으로 유지하게 했음
- 결과적으로 홈 추천 코인 목록은 CoinGecko 응답이 살아 있어도 현재 소스의 curated 목록을 따르게 됐음
- 검증
  - `pnpm.cmd typecheck` 통과
  - 대상 파일 `eslint` 통과

## 해결되지 않은 것

- 이미 떠 있는 dev 서버나 캐시된 화면이 있다면 새 코드 반영 전까지 예전 목록이 잠깐 보일 수 있음
