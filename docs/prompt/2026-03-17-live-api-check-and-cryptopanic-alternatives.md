# 실데이터 라이브 체크와 CryptoPanic 대체안 정리 프롬프트

- 작성시각: 2026-03-17 17:18 KST
- 해결하고자 한 문제:
  - CryptoPanic 대체 가능성을 정리하고, 현재 외부 데이터 소스들의 실데이터 수신 여부를 확인 가능한 테스트를 만들어야 했다.

## 사용한 프롬프트

```text
CryptoPanic 대체할수 있는 다른 방법 생각해줘. 그리고 CoinGecko + Alternative.me + CryptoPanic + Bybit + Hyperliquid 실제 데이터값 받아오는지 테스트. 그리고 관련문서 업데이트
```

## 해결된 것

- 라이브 API 테스트 파일과 실행 스크립트를 추가했다.
- CryptoPanic 대체 후보를 문서에 정리했다.

## 아직 안 된 것

- CryptoPanic 키가 없으면 해당 라이브 테스트는 skip된다.
- 대체 API 코드는 아직 붙이지 않았다.
