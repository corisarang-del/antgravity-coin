import { rm } from "node:fs/promises";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { coinGeckoFetch } from "@/infrastructure/api/coinGeckoClient";
import { fetchMarketData } from "@/application/useCases/fetchMarketData";
import { listCharacterDebateProfiles } from "@/shared/constants/characterDebateProfiles";
import { fetchFearGreedIndex } from "@/infrastructure/api/fearGreedClient";
import { fetchBybitLongShortRatio } from "@/infrastructure/api/bybitClient";
import { fetchHyperliquidPerpetualMetrics } from "@/infrastructure/api/hyperliquidClient";
import { fetchNewsSentiment } from "@/infrastructure/api/newsSentimentClient";

vi.mock("@/infrastructure/api/coinGeckoClient", () => ({
  coinGeckoFetch: vi.fn(),
}));

vi.mock("@/infrastructure/api/fearGreedClient", () => ({
  fetchFearGreedIndex: vi.fn(),
}));

vi.mock("@/infrastructure/api/newsSentimentClient", () => ({
  fetchNewsSentiment: vi.fn(),
}));

vi.mock("@/infrastructure/api/bybitClient", () => ({
  fetchBybitLongShortRatio: vi.fn(),
}));

vi.mock("@/infrastructure/api/hyperliquidClient", () => ({
  fetchHyperliquidPerpetualMetrics: vi.fn(),
}));

describe("fetchMarketData", () => {
  beforeEach(async () => {
    await rm(path.join(process.cwd(), "database", "data", "source_cache.json"), {
      force: true,
    });
    vi.mocked(coinGeckoFetch).mockReset();
    vi.mocked(fetchFearGreedIndex).mockResolvedValue({
      value: 61,
      label: "Greed",
    });
    vi.mocked(fetchNewsSentiment).mockResolvedValue({
      sentimentScore: 0.34,
      summary: "Alpha Vantage sentiment is mostly positive.",
      headlines: ["Bitcoin breakout gains momentum", "ETF approval keeps market optimistic"],
      eventSummary: "Bitcoin headlines stay positive and momentum remains constructive.",
      source: "alpha-vantage",
    });
    vi.mocked(fetchBybitLongShortRatio).mockResolvedValue(1.08);
    vi.mocked(fetchHyperliquidPerpetualMetrics).mockResolvedValue({
      openInterest: 128_000_000,
      fundingRate: 0.0123,
      whaleScore: 64,
    });
  });

  it("returns market data with extended evidence fields", async () => {
    vi.mocked(coinGeckoFetch)
      .mockResolvedValueOnce([
        {
          id: "bitcoin",
          symbol: "btc",
          current_price: 84000,
          price_change_percentage_24h: 2.4,
          price_change_percentage_7d_in_currency: 6.8,
          total_volume: 31_000_000_000,
        },
      ])
      .mockResolvedValueOnce({
        prices: Array.from({ length: 30 }, (_, index) => [index, 82000 + index * 100]),
      });

    const result = await fetchMarketData("bitcoin");

    expect(result.symbol).toBe("BTC");
    expect(result.newsHeadlines).toHaveLength(2);
    expect(result.newsEventSummary).toContain("Bitcoin");
    expect(result.communitySentimentSummary).toBeTruthy();
    expect(result.whaleFlowSummary).toContain("Bybit");
    expect(result.marketStructureSummary).toContain("CoinGecko");
  });

  it("still builds market data when optional sources all fail", async () => {
    vi.mocked(coinGeckoFetch)
      .mockResolvedValueOnce([
        {
          id: "bitcoin",
          symbol: "btc",
          current_price: 84000,
          price_change_percentage_24h: 2.4,
          price_change_percentage_7d_in_currency: 6.8,
          total_volume: 31_000_000_000,
        },
      ])
      .mockResolvedValueOnce({
        prices: Array.from({ length: 30 }, (_, index) => [index, 82000 + index * 100]),
      });
    vi.mocked(fetchFearGreedIndex).mockRejectedValueOnce(new Error("fear-greed-failed"));
    vi.mocked(fetchNewsSentiment).mockRejectedValueOnce(new Error("news-pipeline-failed"));
    vi.mocked(fetchBybitLongShortRatio).mockRejectedValueOnce(new Error("bybit-failed"));
    vi.mocked(fetchHyperliquidPerpetualMetrics).mockRejectedValueOnce(
      new Error("hyperliquid-failed"),
    );

    const result = await fetchMarketData("bitcoin");

    expect(result.symbol).toBe("BTC");
    expect(result.rsi).toBeGreaterThan(0);
    expect(result.fearGreedIndex).toBeNull();
    expect(result.sentimentScore).toBeNull();
    expect(result.newsHeadlines).toEqual([]);
    expect(result.newsEventSummary).toBeNull();
    expect(result.communitySentimentSummary).toBeNull();
    expect(result.longShortRatio).toBeNull();
    expect(result.openInterest).toBeNull();
    expect(result.fundingRate).toBeNull();
    expect(result.whaleScore).toBeNull();
    expect(result.whaleFlowSummary).toBeNull();
    expect(result.marketStructureSummary).toContain("CoinGecko");
  });

  it("fills all required market evidence fields when all sources succeed", async () => {
    vi.mocked(coinGeckoFetch)
      .mockResolvedValueOnce([
        {
          id: "bitcoin",
          symbol: "btc",
          current_price: 84000,
          price_change_percentage_24h: 2.4,
          price_change_percentage_7d_in_currency: 6.8,
          total_volume: 31_000_000_000,
        },
      ])
      .mockResolvedValueOnce({
        prices: Array.from({ length: 30 }, (_, index) => [index, 82000 + index * 100]),
      });

    const result = await fetchMarketData("bitcoin");
    const marketEvidenceSources = listCharacterDebateProfiles().flatMap((profile) =>
      profile.evidenceSources.filter((source) => source.kind === "market"),
    );

    for (const evidence of marketEvidenceSources) {
      const value = result[evidence.field];
      expect(value).not.toBeNull();
      expect(value).not.toBeUndefined();
    }

    expect(result.newsHeadlines.length).toBeGreaterThan(0);
    expect(result.communitySentimentSummary).toBeTruthy();
    expect(result.whaleFlowSummary).toBeTruthy();
    expect(result.marketStructureSummary).toBeTruthy();
  });

  it("keeps Hyperliquid derivatives data when Bybit returns 403", async () => {
    vi.mocked(coinGeckoFetch)
      .mockResolvedValueOnce([
        {
          id: "bitcoin",
          symbol: "btc",
          current_price: 84000,
          price_change_percentage_24h: 2.4,
          price_change_percentage_7d_in_currency: 6.8,
          total_volume: 31_000_000_000,
        },
      ])
      .mockResolvedValueOnce({
        prices: Array.from({ length: 30 }, (_, index) => [index, 82000 + index * 100]),
      });
    vi.mocked(fetchBybitLongShortRatio).mockRejectedValueOnce(
      new Error("Bybit account ratio request failed: 403"),
    );

    const result = await fetchMarketData("bitcoin");

    expect(result.longShortRatio).toBeNull();
    expect(result.openInterest).toBe(128_000_000);
    expect(result.fundingRate).toBe(0.0123);
    expect(result.whaleScore).toBe(64);
    expect(result.whaleFlowSummary).toContain("Hyperliquid");
  });
});
