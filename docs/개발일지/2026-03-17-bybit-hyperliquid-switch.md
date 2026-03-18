# Bybit + Hyperliquid 전환

- 작성시각: 2026-03-17 15:22 KST
- 해결하고자 한 문제:
  - `Coinglass` 의존을 제거하고, 무료 공개 API인 `Bybit + Hyperliquid` 조합으로 선물 지표를 대체해야 했다.
  - `longShortRatio`, `whaleScore`, 리스크용 근거 필드가 모두 실제 공개 데이터 기반이어야 했다.

## 해결된 것

- `Bybit` 공개 market endpoint로 `longShortRatio`를 가져오는 클라이언트를 추가했다.
- `Hyperliquid` 공개 `info` endpoint로 `openInterest`, `fundingRate`, `whaleScore` 계산용 원데이터를 가져오도록 추가했다.
- `fetchMarketData`를 `CoinGecko + Alternative.me + CryptoPanic + Bybit + Hyperliquid` 조합으로 재구성했다.
- `liquidation24h` 의존을 제거하고 `openInterest`, `fundingRate` 중심으로 `Shade`, `Vela` 근거를 바꿨다.
- `MarketData` 스키마와 관련 테스트, planning 문서를 새 구조에 맞게 수정했다.

## 아직 안 된 것

- `docs/planning`의 오래된 task/history 문서 일부에는 과거 `Coinglass` 언급이 남아 있을 수 있다.
- 실제 운영 환경에서 Bybit/Hyperliquid 응답 제한이나 지역 제한은 별도 실서비스 검증이 필요하다.
