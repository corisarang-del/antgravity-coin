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

  if (!latest || prices.length < 20 || latest.total_volume == null || latest.price_change_percentage_24h == null) {
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
    longShortRatio: derivatives?.longShortRatio ?? null,
    openInterest: derivatives?.openInterest ?? null,
    fundingRate: derivatives?.fundingRate ?? null,
    whaleScore: derivatives?.whaleScore ?? null,
    volume24h: marketSeed.volume24h,
  };
}
