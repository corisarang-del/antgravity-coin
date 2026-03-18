# 실근거 소스 강제 및 외부 API 실호출 전환

- 작성시각: 2026-03-17 14:55 KST
- 해결하고자 한 문제:
  - `08-character-debate-reference.md`에서 근거 소스를 실호출 기준으로 명확히 표기해야 했다.
  - `CryptoPanic`, `Coinglass`가 실제 API 호출이 아니라 stub였고, `fetchMarketData`에도 mock/synthetic fallback이 남아 있었다.

## 해결된 것

- `fetchFearGreedIndex`, `fetchCryptoPanicSentiment`, `fetchCoinglassMetrics`를 실제 호출 기준으로 정리했다.
- `fetchMarketData`에서 `mockCoins` 기반 fallback과 synthetic seed 의존을 제거하고, CoinGecko 실데이터와 외부 API 응답만 사용하도록 바꿨다.
- `whaleScore`는 Coinglass Whale Index 실호출 값으로 바꿨다.
- `08-character-debate-reference.md`에 각 근거 소스를 `실호출`, `실데이터 기반 계산`, `실시간 토론 데이터`로 명확히 표기했다.
- 클라이언트/유스케이스 테스트를 외부 클라이언트 mock 기반으로 재정비하고, `CryptoPanic`, `Coinglass` 파서 테스트도 추가했다.

## 아직 안 된 것

- 실제 서비스 실행에는 `CRYPTOPANIC_API_KEY`, `COINGLASS_API_KEY`가 반드시 필요하다.
- CryptoPanic 점수는 API 원문 응답의 vote/title 신호를 바탕으로 내부 계산한 값이라, 향후 scoring 규칙은 더 다듬을 수 있다.
