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
      summary: "Alpha Vantage 기사 흐름은 대체로 긍정적이야.",
      source: "alpha-vantage",
    });
    vi.mocked(fetchBybitLongShortRatio).mockResolvedValue(1.08);
    vi.mocked(fetchHyperliquidPerpetualMetrics).mockResolvedValue({
      openInterest: 128_000_000,
      fundingRate: 0.0123,
      whaleScore: 64,
    });
  });

  it("공포탐욕지수와 감성 점수를 포함한 MarketData를 반환한다", async () => {
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
    expect(result.priceChange7d).toBe(6.8);
    expect(result.fearGreedIndex).toBeGreaterThanOrEqual(0);
    expect(result.fearGreedIndex).toBeLessThanOrEqual(100);
    expect(result.sentimentScore).toBeGreaterThanOrEqual(-1);
    expect(result.sentimentScore).toBeLessThanOrEqual(1);
  });

  it("실시장 데이터 조회가 실패하면 오류를 던진다", async () => {
    vi.mocked(coinGeckoFetch).mockRejectedValue(new Error("failed"));

    await expect(fetchMarketData("bitcoin")).rejects.toThrow("failed");
  });

  it("보조 실데이터 소스가 실패해도 배틀용 MarketData는 core 시세 기준으로 만든다", async () => {
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
    expect(result.longShortRatio).toBeNull();
    expect(result.openInterest).toBeNull();
    expect(result.fundingRate).toBeNull();
    expect(result.whaleScore).toBeNull();
  });

  it("8명 프로필에 적힌 market 근거 소스 필드가 실제 MarketData에 채워진다", async () => {
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

      if (typeof value === "number") {
        expect(Number.isFinite(value)).toBe(true);
      }

      if (evidence.source === "Alternative.me") {
        expect(["fearGreedIndex", "fearGreedLabel"]).toContain(evidence.field);
      }

      if (evidence.source.includes("뉴스 감성 파이프라인")) {
        expect(evidence.field).toBe("sentimentScore");
      }

      if (evidence.source === "Bybit 계정 비율") {
        expect(evidence.field).toBe("longShortRatio");
      }

      if (evidence.source === "Hyperliquid Asset Context") {
        expect(["openInterest", "fundingRate"]).toContain(evidence.field);
      }

      if (evidence.source === "Hyperliquid 실데이터 기반 계산") {
        expect(evidence.field).toBe("whaleScore");
      }

      if (evidence.source === "CoinGecko") {
        expect(["priceChange24h", "volume24h"]).toContain(evidence.field);
      }

      if (evidence.source.includes("CoinGecko 30일 가격 히스토리 기반 계산")) {
        expect(["rsi", "macd", "bollingerUpper"]).toContain(evidence.field);
      }

      if (evidence.source === "CoinGecko 7일 변화율") {
        expect(evidence.field).toBe("priceChange7d");
      }
    }
  });
});
