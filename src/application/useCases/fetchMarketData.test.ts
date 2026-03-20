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
      summary: "Alpha Vantage 기사 톤은 대체로 긍정적이야.",
      headlines: ["Bitcoin breakout gains momentum", "ETF approval keeps market optimistic"],
      eventSummary: 'Alpha Vantage 대표 헤드라인은 "Bitcoin breakout gains momentum"이고, 전체 톤은 긍정 재료가 더 강하게 읽혀.',
      source: "alpha-vantage",
    });
    vi.mocked(fetchBybitLongShortRatio).mockResolvedValue(1.08);
    vi.mocked(fetchHyperliquidPerpetualMetrics).mockResolvedValue({
      openInterest: 128_000_000,
      fundingRate: 0.0123,
      whaleScore: 64,
    });
  });

  it("확장된 서술형 근거를 포함한 MarketData를 반환한다", async () => {
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
    expect(result.newsEventSummary).toContain("Bitcoin breakout gains momentum");
    expect(result.communitySentimentSummary).toContain("공포탐욕");
    expect(result.whaleFlowSummary).toContain("Bybit");
    expect(result.marketStructureSummary).toContain("CoinGecko");
  });

  it("보조 데이터 소스가 실패해도 core 시세로 MarketData를 만든다", async () => {
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
    vi.mocked(fetchHyperliquidPerpetualMetrics).mockRejectedValueOnce(new Error("hyperliquid-failed"));

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

  it("캐릭터별 핵심 근거 필드가 MarketData에 실제로 채워진다", async () => {
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
});
