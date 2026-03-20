# 멀티 뉴스 감성 파이프라인 교체

- 작성시각: 2026-03-17 17:45 KST
- 해결하고자 한 문제:
  - `CryptoPanic` 단일 의존을 제거하고 `Alpha Vantage 1순위 -> GDELT -> NewsAPI` 순서의 뉴스 감성 파이프라인으로 실제 교체해야 했다.

## 해결된 것

- `CryptoPanic` 클라이언트를 제거했다.
- `Alpha Vantage`, `GDELT`, `NewsAPI` 클라이언트를 추가했다.
- `fetchNewsSentiment`에서 1순위부터 차례대로 fallback 하도록 구성했다.
- `fetchMarketData`가 새 뉴스 감성 파이프라인을 사용하도록 바꿨다.
- 라이브 테스트와 planning 문서를 새 구조에 맞게 갱신했다.

## 아직 안 된 것

- `Alpha Vantage`, `NewsAPI` 키가 비어 있으면 현재 환경에서는 `GDELT`가 사실상 1차 뉴스 소스로 동작한다.
- 세 소스를 동시에 합산하는 앙상블 점수화는 아직 구현하지 않았다.

