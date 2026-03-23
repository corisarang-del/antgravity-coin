import { coinGeckoFetch } from "@/infrastructure/api/coinGeckoClient";
import { fetchFearGreedIndex } from "@/infrastructure/api/fearGreedClient";
import { fetchNewsSentiment } from "@/infrastructure/api/newsSentimentClient";
import { fetchBybitLongShortRatio } from "@/infrastructure/api/bybitClient";
import { fetchHyperliquidPerpetualMetrics } from "@/infrastructure/api/hyperliquidClient";
import {
  type CachedDerivativesValue,
  type CachedFearGreedValue,
  type CachedMarketSeed,
  type CachedNewsSentimentValue,
  FileDataCacheRepository,
} from "@/infrastructure/db/fileDataCacheRepository";
import { cachePolicy } from "@/shared/constants/cachePolicy";
import { calcBollingerBands, calcMacd, calcRsi } from "@/shared/utils/calcTechnicals";
import type { MarketData } from "@/domain/models/MarketData";

interface CoinGeckoMarketCoin {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d_in_currency: number | null;
  total_volume: number | null;
}

interface CoinGeckoMarketChartResponse {
  prices: Array<[number, number]>;
}

function isSoftFresh(expiresAt: string) {
  return new Date(expiresAt).getTime() > Date.now();
}

function isHardFresh(expiresAt: string) {
  return new Date(expiresAt).getTime() > Date.now();
}

function formatUsdCompact(value: number) {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }

  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function buildCommunitySentimentSummary(input: {
  fearGreed: CachedFearGreedValue | null;
  sentiment: CachedNewsSentimentValue | null;
}) {
  const { fearGreed, sentiment } = input;

  if (!fearGreed && !sentiment) {
    return null;
  }

  const fearGreedText = fearGreed
    ? `공포탐욕은 ${fearGreed.value}(${fearGreed.label})`
    : "공포탐욕 데이터는 비어 있고";
  const sentimentText =
    sentiment != null
      ? `뉴스 감성은 ${sentiment.sentimentScore >= 0 ? "+" : ""}${sentiment.sentimentScore.toFixed(2)}`
      : "뉴스 감성 데이터는 비어 있어";

  const stance =
    fearGreed && fearGreed.value <= 20
      ? "군중 공포가 강하지만, 과매도 반등 심리도 함께 열릴 수 있어."
      : fearGreed && fearGreed.value >= 70
        ? "군중 기대가 과열 쪽으로 기울어 되돌림 경계가 필요해."
        : sentiment && sentiment.sentimentScore >= 0.2
          ? "심리는 조심스럽지만 기대 쪽으로 조금 더 기울고 있어."
          : sentiment && sentiment.sentimentScore <= -0.2
            ? "심리는 방어적으로 기울어 있고 실망 반응이 퍼질 여지가 있어."
            : "심리 방향은 아직 중립에 가까워.";

  return `${fearGreedText}, ${sentimentText}라서 ${stance}`;
}

function buildWhaleFlowSummary(input: CachedDerivativesValue | null) {
  if (!input) {
    return null;
  }

  const leverageTone =
    input.longShortRatio >= 1.2
      ? "롱 포지션 쏠림이 강해."
      : input.longShortRatio <= 0.85
        ? "숏 포지션 우위가 보여."
        : "롱숏 균형은 아직 크게 치우치지 않았어.";
  const whaleTone =
    input.whaleScore >= 70
      ? "큰 자금이 개입한 흔적이 비교적 또렷해."
      : input.whaleScore <= 45
        ? "고래성 자금 흐름은 아직 선명하지 않아."
        : "고래 흔적은 있지만 방향 확신까지 줄 정도는 아니야.";

  return `Bybit 롱숏비율은 ${input.longShortRatio.toFixed(2)}이고, Hyperliquid 미결제약정은 ${formatUsdCompact(input.openInterest)} 수준이야. 펀딩비는 ${input.fundingRate.toFixed(4)}%라서 ${leverageTone} ${whaleTone}`;
}

function buildMarketStructureSummary(input: {
  marketSeed: CachedMarketSeed;
  derivatives: CachedDerivativesValue | null;
}) {
  const { marketSeed, derivatives } = input;
  const trendText =
    marketSeed.priceChange24h >= 0
      ? `24시간은 ${marketSeed.priceChange24h.toFixed(2)}% 상승`
      : `24시간은 ${Math.abs(marketSeed.priceChange24h).toFixed(2)}% 하락`;
  const weeklyText =
    marketSeed.priceChange7d >= 0
      ? `7일은 ${marketSeed.priceChange7d.toFixed(2)}% 상승`
      : `7일은 ${Math.abs(marketSeed.priceChange7d).toFixed(2)}% 하락`;
  const oiText = derivatives
    ? `미결제약정은 ${formatUsdCompact(derivatives.openInterest)} 수준`
    : "미결제약정 데이터는 비어 있음";

  const structureTone =
    derivatives && derivatives.openInterest > marketSeed.volume24h * 0.45
      ? "파생 체력이 강해서 구조가 가볍지 않아."
      : marketSeed.volume24h >= 10_000_000_000
        ? "현물 거래 강도는 충분해서 구조가 쉽게 비지 않아."
        : "거래 구조 체력은 평이해서 쉽게 흔들릴 수 있어.";

  return `CoinGecko 기준 거래대금은 ${formatUsdCompact(marketSeed.volume24h)}이고, ${trendText}, ${weeklyText} 상태야. ${oiText}라서 ${structureTone}`;
}

async function fetchMarketSeedFromSource(coinId: string): Promise<CachedMarketSeed> {
  const [marketCoin, marketChart] = await Promise.all([
    coinGeckoFetch<CoinGeckoMarketCoin[]>(
      `/coins/markets?vs_currency=usd&ids=${encodeURIComponent(coinId)}&price_change_percentage=7d`,
    ),
    coinGeckoFetch<CoinGeckoMarketChartResponse>(
      `/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=usd&days=30&interval=daily`,
    ),
  ]);

  const latest = marketCoin[0];
  const prices = marketChart.prices.map(([, price]) => Number(price.toFixed(2))).filter(Boolean);

  if (
    !latest ||
    prices.length < 20 ||
    latest.total_volume == null ||
    latest.price_change_percentage_24h == null
  ) {
    throw new Error("CoinGecko market seed is incomplete");
  }

  const previous7dPrice = prices[Math.max(0, prices.length - 8)];
  const derived7d =
    previous7dPrice > 0 ? ((latest.current_price - previous7dPrice) / previous7dPrice) * 100 : null;
  const actual7d = latest.price_change_percentage_7d_in_currency ?? derived7d;

  if (actual7d == null) {
    throw new Error("CoinGecko 7d change missing");
  }

  return {
    coinId: latest.id,
    symbol: latest.symbol.toUpperCase(),
    currentPrice: latest.current_price,
    priceChange24h: Number(latest.price_change_percentage_24h.toFixed(2)),
    priceChange7d: Number(actual7d.toFixed(2)),
    volume24h: latest.total_volume,
    prices,
  };
}

async function getCachedMarketSeed(coinId: string) {
  const repository = new FileDataCacheRepository();
  const cached = await repository.getMarketSeed(coinId);

  if (cached && isSoftFresh(cached.softExpiresAt)) {
    return cached.value;
  }

  if (cached && isHardFresh(cached.hardExpiresAt)) {
    void fetchMarketSeedFromSource(coinId)
      .then((value) => repository.saveMarketSeed(coinId, value, cachePolicy.marketSeed))
      .catch(() => undefined);
    return cached.value;
  }

  const fresh = await fetchMarketSeedFromSource(coinId);
  await repository.saveMarketSeed(coinId, fresh, cachePolicy.marketSeed);
  return fresh;
}

async function getCachedFearGreed() {
  const repository = new FileDataCacheRepository();
  const cached = await repository.getFearGreed();

  if (cached && isSoftFresh(cached.softExpiresAt)) {
    return cached.value;
  }

  if (cached && isHardFresh(cached.hardExpiresAt)) {
    void fetchFearGreedIndex()
      .then((value) => repository.saveFearGreed(value as CachedFearGreedValue, cachePolicy.fearGreed))
      .catch(() => undefined);
    return cached.value;
  }

  const fresh = await fetchFearGreedIndex();
  await repository.saveFearGreed(fresh as CachedFearGreedValue, cachePolicy.fearGreed);
  return fresh;
}

async function getCachedNewsSentiment(symbol: string) {
  const repository = new FileDataCacheRepository();
  const cached = await repository.getNewsSentiment(symbol);

  if (cached && isSoftFresh(cached.softExpiresAt)) {
    return cached.value;
  }

  if (cached && isHardFresh(cached.hardExpiresAt)) {
    void fetchNewsSentiment(symbol)
      .then((value) =>
        repository.saveNewsSentiment(symbol, value as CachedNewsSentimentValue, cachePolicy.newsSentiment),
      )
      .catch(() => undefined);
    return cached.value;
  }

  const fresh = await fetchNewsSentiment(symbol);
  await repository.saveNewsSentiment(
    symbol,
    fresh as CachedNewsSentimentValue,
    cachePolicy.newsSentiment,
  );
  return fresh;
}

async function getCachedDerivatives(symbol: string) {
  const repository = new FileDataCacheRepository();
  const cached = await repository.getDerivatives(symbol);

  if (cached && isSoftFresh(cached.softExpiresAt)) {
    return cached.value;
  }

  const fetchFresh = async () => {
    const [longShortRatio, hyperliquid] = await Promise.all([
      fetchBybitLongShortRatio(symbol),
      fetchHyperliquidPerpetualMetrics(symbol),
    ]);

    return {
      longShortRatio,
      openInterest: hyperliquid.openInterest,
      fundingRate: hyperliquid.fundingRate,
      whaleScore: hyperliquid.whaleScore,
    } satisfies CachedDerivativesValue;
  };

  if (cached && isHardFresh(cached.hardExpiresAt)) {
    void fetchFresh()
      .then((value) => repository.saveDerivatives(symbol, value, cachePolicy.derivatives))
      .catch(() => undefined);
    return cached.value;
  }

  const fresh = await fetchFresh();
  await repository.saveDerivatives(symbol, fresh, cachePolicy.derivatives);
  return fresh;
}

export async function fetchMarketData(coinId: string): Promise<MarketData> {
  const marketSeed = await getCachedMarketSeed(coinId);
  const [fearGreedResult, sentimentResult, derivativesResult] = await Promise.allSettled([
    getCachedFearGreed(),
    getCachedNewsSentiment(marketSeed.symbol),
    getCachedDerivatives(marketSeed.symbol),
  ]);
  const bollinger = calcBollingerBands(marketSeed.prices);

  const fearGreed = fearGreedResult.status === "fulfilled" ? fearGreedResult.value : null;
  const sentiment = sentimentResult.status === "fulfilled" ? sentimentResult.value : null;
  const derivatives = derivativesResult.status === "fulfilled" ? derivativesResult.value : null;

  return {
    coinId: marketSeed.coinId,
    symbol: marketSeed.symbol,
    currentPrice: marketSeed.currentPrice,
    priceChange24h: marketSeed.priceChange24h,
    priceChange7d: marketSeed.priceChange7d,
    rsi: calcRsi(marketSeed.prices),
    macd: calcMacd(marketSeed.prices),
    bollingerUpper: bollinger.upper,
    bollingerLower: bollinger.lower,
    fearGreedIndex: fearGreed?.value ?? null,
    fearGreedLabel: fearGreed?.label ?? null,
    sentimentScore: sentiment?.sentimentScore ?? null,
    newsHeadlines: sentiment?.headlines ?? [],
    newsEventSummary: sentiment?.eventSummary ?? null,
    communitySentimentSummary: buildCommunitySentimentSummary({
      fearGreed,
      sentiment,
    }),
    longShortRatio: derivatives?.longShortRatio ?? null,
    openInterest: derivatives?.openInterest ?? null,
    fundingRate: derivatives?.fundingRate ?? null,
    whaleScore: derivatives?.whaleScore ?? null,
    whaleFlowSummary: buildWhaleFlowSummary(derivatives),
    marketStructureSummary: buildMarketStructureSummary({
      marketSeed,
      derivatives,
    }),
    volume24h: marketSeed.volume24h,
  };
}
