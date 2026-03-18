# 캐시 전략

## 1. 캐시 JSON 스키마

파일 위치: `database/data/source_cache.json`

```ts
interface CacheEntry<T> {
  key: string;
  value: T;
  fetchedAt: string;
  softExpiresAt: string;
  hardExpiresAt: string;
}

interface CachedMarketSeed {
  coinId: string;
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  priceChange7d: number;
  volume24h: number;
  prices: number[];
}

interface CachedFearGreedValue {
  value: number;
  label: string;
}

interface CachedNewsSentimentValue {
  sentimentScore: number;
  summary: string;
  source: "alpha-vantage" | "gdelt" | "newsapi";
}

interface CachedDerivativesValue {
  longShortRatio: number;
  openInterest: number;
  fundingRate: number;
  whaleScore: number;
}

interface DataSourceCacheStore {
  version: 1;
  marketSeeds: CacheEntry<CachedMarketSeed>[];
  newsSentiments: CacheEntry<CachedNewsSentimentValue>[];
  derivatives: CacheEntry<CachedDerivativesValue>[];
  fearGreed: CacheEntry<CachedFearGreedValue> | null;
}
```

## 2. 무료 호출량 기준 배치 수집 주기표

무료 호출량 기준:

- Alpha Vantage 무료: 하루 25회
- NewsAPI 무료: 하루 100회
- GDELT: 명시 quota보다 429 회피가 중요
- Bybit/Hyperliquid: 공개 market/info 기준 충분히 넉넉
- Alternative.me: 느린 지표라 자주 호출 불필요

권장 주기:

| 데이터 | 소스 | 주기 | 하루 호출량(4개 인기코인 기준) | 메모 |
|---|---|---:|---:|---|
| marketSeed | CoinGecko | 2분 | 온디맨드 + prewarm | 배틀 핵심 데이터 |
| fearGreed | Alternative.me | 60분 | 24회 | 전역 1건 |
| newsSentiment | Alpha Vantage | 30분 | 16회 | `BTC, ETH, XRP, SOL`만 우선 수집 |
| newsSentiment fallback | GDELT | Alpha Vantage 실패 시만 | 가변 | 429 주의 |
| newsSentiment fallback | NewsAPI | GDELT 실패 시만 | 가변 | 100/day 안쪽 유지 |
| derivatives | Bybit + Hyperliquid | 2분 | 온디맨드 + prewarm | 인기 코인만 사전수집 |

배치 수집 우선 코인:

- `bitcoin`
- `ethereum`
- `xrp`
- `solana`

## 3. 화면별 stale 데이터 허용 정책

| 화면 | 허용 stale | 정책 |
|---|---|---|
| `/home` Top 코인 | 5분 | stale 허용, 백그라운드 갱신 |
| `/home` 검색 자동완성 | 10분 | stale 허용 가능 |
| `/battle/[coinId]` 핵심 시세 | 2분 soft / 10분 hard | soft stale면 즉시 사용, 백그라운드 갱신 |
| `/battle/[coinId]` 공포탐욕 | 1시간 soft / 6시간 hard | stale 허용 |
| `/battle/[coinId]` 뉴스 감성 | 15분 soft / 2시간 hard | stale 허용 |
| `/battle/[coinId]` 파생지표 | 2분 soft / 10분 hard | stale 허용 |
| `/result` 결과 표시 | snapshot 기준 | 저장된 배틀 스냅샷 우선 |

운영 원칙:

- `marketSeed`가 없으면 배틀 시작 불가
- 보조 소스가 stale이거나 비어도 배틀은 계속 진행
- 필요한 근거가 비는 캐릭터는 사과 메시지 출력

## 4. 구현 상태

현재 구현된 것:

- `source_cache.json` 파일 캐시 저장소
- `fetchMarketData` 캐시 우선 조회
- soft TTL 내면 캐시 즉시 사용
- hard TTL 내 stale이면 stale 응답 후 백그라운드 갱신
- `POST /api/admin/cache/prewarm`로 인기 코인 prewarm 가능
