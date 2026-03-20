# CryptoPanic 대체 구현

- 작성시각: 2026-03-17 18:02 KST
- 해결하고자 한 문제:
  - `CryptoPanic`를 제거하고 `Alpha Vantage -> GDELT -> NewsAPI` 순서의 실제 멀티 뉴스 감성 파이프라인으로 교체해야 했다.

## 해결된 것

- `CryptoPanic` 클라이언트를 제거했다.
- `Alpha Vantage`, `GDELT`, `NewsAPI` 클라이언트를 추가했다.
- `fetchNewsSentiment`에서 1순위부터 차례대로 fallback 하도록 구성했다.
- `fetchMarketData`가 새 뉴스 감성 파이프라인을 사용하게 바꿨다.
- 라이브 테스트를 새 파이프라인 기준으로 갱신했고, `GDELT` 429는 라이브 보류로 처리했다.
- planning 문서를 현재 구현 기준으로 갱신했다.

## 아직 안 된 것

- `Alpha Vantage`, `NewsAPI` 키가 비어 있으면 현재 환경에서는 `GDELT`가 사실상 유일한 뉴스 감성 소스다.
- 세 소스를 동시에 합산하는 앙상블 점수화는 아직 구현하지 않았다.

