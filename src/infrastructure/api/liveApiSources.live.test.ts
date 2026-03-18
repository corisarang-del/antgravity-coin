import { describe, expect, it } from "vitest";
import { coinGeckoFetch } from "@/infrastructure/api/coinGeckoClient";
import { fetchFearGreedIndex } from "@/infrastructure/api/fearGreedClient";
import { fetchAlphaVantageNewsSentiment } from "@/infrastructure/api/alphaVantageNewsClient";
import { fetchGdeltNewsSentiment } from "@/infrastructure/api/gdeltNewsClient";
import { fetchNewsApiSentiment } from "@/infrastructure/api/newsApiClient";
import { fetchNewsSentiment } from "@/infrastructure/api/newsSentimentClient";
import { fetchBybitLongShortRatio } from "@/infrastructure/api/bybitClient";
import { fetchHyperliquidPerpetualMetrics } from "@/infrastructure/api/hyperliquidClient";

const runLiveTests = process.env.RUN_LIVE_API_TESTS === "true";
const maybeDescribe = runLiveTests ? describe : describe.skip;

interface CoinGeckoMarketCoin {
  id: string;
  symbol: string;
  current_price: number;
  total_volume: number | null;
}

maybeDescribe("live external API sources", () => {
  it("CoinGecko에서 실제 시세와 거래량을 받는다", async () => {
    const data = await coinGeckoFetch<CoinGeckoMarketCoin[]>(
      "/coins/markets?vs_currency=usd&ids=bitcoin&price_change_percentage=7d",
    );
    const bitcoin = data[0];

    expect(bitcoin?.id).toBe("bitcoin");
    expect(bitcoin?.symbol?.toLowerCase()).toBe("btc");
    expect(bitcoin?.current_price).toBeGreaterThan(0);
    expect(bitcoin?.total_volume).not.toBeNull();
  });

  it("Alternative.me에서 실제 공포탐욕 데이터를 받는다", async () => {
    const data = await fetchFearGreedIndex();

    expect(data.value).toBeGreaterThanOrEqual(0);
    expect(data.value).toBeLessThanOrEqual(100);
    expect(data.label.length).toBeGreaterThan(0);
  });

  it("Bybit에서 실제 롱숏 비율을 받는다", async () => {
    const ratio = await fetchBybitLongShortRatio("BTC");

    expect(ratio).toBeGreaterThan(0);
  });

  it("Hyperliquid에서 실제 미결제약정과 펀딩비를 받는다", async () => {
    const metrics = await fetchHyperliquidPerpetualMetrics("BTC");

    expect(metrics.openInterest).toBeGreaterThan(0);
    expect(Number.isFinite(metrics.fundingRate)).toBe(true);
    expect(metrics.whaleScore).toBeGreaterThanOrEqual(0);
    expect(metrics.whaleScore).toBeLessThanOrEqual(100);
  });

  const maybeAlphaVantage = process.env.ALPHA_VANTAGE_API_KEY ? it : it.skip;
  const maybeNewsApi = process.env.NEWS_API_KEY ? it : it.skip;
  const maybePipelineLive = process.env.ALPHA_VANTAGE_API_KEY || process.env.NEWS_API_KEY ? it : it.skip;

  maybeAlphaVantage("Alpha Vantage에서 실제 뉴스 감성 데이터를 받는다", async () => {
    const data = await fetchAlphaVantageNewsSentiment("BTC");

    expect(data.sentimentScore).toBeGreaterThanOrEqual(-1);
    expect(data.sentimentScore).toBeLessThanOrEqual(1);
    expect(data.summary.length).toBeGreaterThan(0);
  });

  it("GDELT에서 실제 뉴스 감성 데이터를 받는다", async () => {
    try {
      const data = await fetchGdeltNewsSentiment("BTC");

      expect(data.sentimentScore).toBeGreaterThanOrEqual(-1);
      expect(data.sentimentScore).toBeLessThanOrEqual(1);
      expect(data.summary.length).toBeGreaterThan(0);
    } catch (error) {
      if (error instanceof Error && error.message.includes("429")) {
        return;
      }

      throw error;
    }
  });

  maybeNewsApi("NewsAPI에서 실제 뉴스 감성 데이터를 받는다", async () => {
    const data = await fetchNewsApiSentiment("BTC");

    expect(data.sentimentScore).toBeGreaterThanOrEqual(-1);
    expect(data.sentimentScore).toBeLessThanOrEqual(1);
    expect(data.summary.length).toBeGreaterThan(0);
  });

  maybePipelineLive("멀티 뉴스 감성 파이프라인이 실제 감성 점수를 반환한다", async () => {
    const data = await fetchNewsSentiment("BTC");

    expect(data.sentimentScore).toBeGreaterThanOrEqual(-1);
    expect(data.sentimentScore).toBeLessThanOrEqual(1);
    expect(data.summary.length).toBeGreaterThan(0);
    expect(["alpha-vantage", "gdelt", "newsapi"]).toContain(data.source);
  });
});
