# Bybit + Hyperliquid 전환 프롬프트

- 작성시각: 2026-03-17 15:22 KST
- 해결하고자 한 문제:
  - `Coinglass`를 빼고 `Bybit + Hyperliquid` 공개 API 조합으로 실제 근거 데이터를 만들도록 바꿔야 했다.

## 사용한 프롬프트

```text
https://bybit-exchange.github.io/docs/api-explorer/v5/category 랑 https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals 여기서 관련된 api 키값을 받아서 Coinglass 의존을 Bybit + Hyperliquid 조합으로 바꿔줘
```

## 해결된 것

- Bybit와 Hyperliquid 공개 엔드포인트 기준으로 선물 지표 수집을 재구성했다.
- 문서, 모델, 테스트를 새 구조에 맞게 갱신했다.

## 아직 안 된 것

- 실제 배포 환경에서 지역 제한이나 응답 제한은 운영 검증이 더 필요하다.

