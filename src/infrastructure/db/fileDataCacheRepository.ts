import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CacheTtlPolicy } from "@/shared/constants/cachePolicy";

export interface CachedMarketSeed {
  coinId: string;
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  priceChange7d: number;
  volume24h: number;
  prices: number[];
}

export interface CachedFearGreedValue {
  value: number;
  label: string;
}

export interface CachedNewsSentimentValue {
  sentimentScore: number;
  summary: string;
  headlines: string[];
  eventSummary: string;
  source: "alpha-vantage" | "gdelt" | "newsapi";
}

export interface CachedDerivativesValue {
  longShortRatio: number;
  openInterest: number;
  fundingRate: number;
  whaleScore: number;
}

interface CacheEntry<TValue> {
  key: string;
  value: TValue;
  fetchedAt: string;
  softExpiresAt: string;
  hardExpiresAt: string;
}

interface DataSourceCacheStore {
  version: 1;
  marketSeeds: CacheEntry<CachedMarketSeed>[];
  newsSentiments: CacheEntry<CachedNewsSentimentValue>[];
  derivatives: CacheEntry<CachedDerivativesValue>[];
  fearGreed: CacheEntry<CachedFearGreedValue> | null;
}

const DATA_DIR = path.join(process.cwd(), "database", "data");
const DATA_FILE = path.join(DATA_DIR, "source_cache.json");

async function ensureStore(): Promise<DataSourceCacheStore> {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    const rawValue = await readFile(DATA_FILE, "utf8");
    return JSON.parse(rawValue) as DataSourceCacheStore;
  } catch {
    const initialValue: DataSourceCacheStore = {
      version: 1,
      marketSeeds: [],
      newsSentiments: [],
      derivatives: [],
      fearGreed: null,
    };
    await writeFile(DATA_FILE, JSON.stringify(initialValue, null, 2), "utf8");
    return initialValue;
  }
}

async function saveStore(store: DataSourceCacheStore) {
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

function createEntry<TValue>(key: string, value: TValue, policy: CacheTtlPolicy): CacheEntry<TValue> {
  const now = Date.now();
  return {
    key,
    value,
    fetchedAt: new Date(now).toISOString(),
    softExpiresAt: new Date(now + policy.softTtlMs).toISOString(),
    hardExpiresAt: new Date(now + policy.hardTtlMs).toISOString(),
  };
}

export class FileDataCacheRepository {
  async getMarketSeed(coinId: string) {
    const store = await ensureStore();
    return store.marketSeeds.find((entry) => entry.key === coinId) ?? null;
  }

  async saveMarketSeed(coinId: string, value: CachedMarketSeed, policy: CacheTtlPolicy) {
    const store = await ensureStore();
    store.marketSeeds = store.marketSeeds.filter((entry) => entry.key !== coinId);
    store.marketSeeds.push(createEntry(coinId, value, policy));
    await saveStore(store);
  }

  async getNewsSentiment(symbol: string) {
    const store = await ensureStore();
    return store.newsSentiments.find((entry) => entry.key === symbol) ?? null;
  }

  async saveNewsSentiment(symbol: string, value: CachedNewsSentimentValue, policy: CacheTtlPolicy) {
    const store = await ensureStore();
    store.newsSentiments = store.newsSentiments.filter((entry) => entry.key !== symbol);
    store.newsSentiments.push(createEntry(symbol, value, policy));
    await saveStore(store);
  }

  async getDerivatives(symbol: string) {
    const store = await ensureStore();
    return store.derivatives.find((entry) => entry.key === symbol) ?? null;
  }

  async saveDerivatives(symbol: string, value: CachedDerivativesValue, policy: CacheTtlPolicy) {
    const store = await ensureStore();
    store.derivatives = store.derivatives.filter((entry) => entry.key !== symbol);
    store.derivatives.push(createEntry(symbol, value, policy));
    await saveStore(store);
  }

  async getFearGreed() {
    const store = await ensureStore();
    return store.fearGreed;
  }

  async saveFearGreed(value: CachedFearGreedValue, policy: CacheTtlPolicy) {
    const store = await ensureStore();
    store.fearGreed = createEntry("global", value, policy);
    await saveStore(store);
  }
}
