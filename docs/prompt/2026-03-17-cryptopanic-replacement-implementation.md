# CryptoPanic 대체 구현 프롬프트

- 작성시각: 2026-03-17 18:02 KST
- 해결하고자 한 문제:
  - `CryptoPanic`를 제거하고 `Alpha Vantage -> GDELT -> NewsAPI` 순서의 멀티 뉴스 감성 파이프라인으로 실제 교체해야 했다.

## 사용한 프롬프트

```text
CryptoPanic 클라이언트를 제거
Alpha Vantage를 1순위
GDELT
NewsAPI
순으로 멀티 뉴스 감성 파이프라인으로 실제 교체

구현해줘
```

## 해결된 것

- 단일 `CryptoPanic` 대신 세 소스를 순차 fallback 하는 뉴스 감성 파이프라인을 구현했다.
- 테스트와 planning 문서를 현재 구현 기준으로 갱신했다.

## 아직 안 된 것

- 세 소스를 동시에 합산하는 앙상블 점수화는 아직 구현하지 않았다.

