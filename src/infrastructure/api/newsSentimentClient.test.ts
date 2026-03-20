import { describe, expect, it, vi } from "vitest";

vi.mock("@/infrastructure/api/alphaVantageNewsClient", () => ({
  fetchAlphaVantageNewsSentiment: vi.fn(),
}));

vi.mock("@/infrastructure/api/gdeltNewsClient", () => ({
  fetchGdeltNewsSentiment: vi.fn(),
}));

vi.mock("@/infrastructure/api/newsApiClient", () => ({
  fetchNewsApiSentiment: vi.fn(),
}));

import { fetchAlphaVantageNewsSentiment } from "@/infrastructure/api/alphaVantageNewsClient";
import { fetchGdeltNewsSentiment } from "@/infrastructure/api/gdeltNewsClient";
import { fetchNewsApiSentiment } from "@/infrastructure/api/newsApiClient";
import { fetchNewsSentiment } from "@/infrastructure/api/newsSentimentClient";

describe("fetchNewsSentiment", () => {
  it("Alpha Vantage가 성공하면 1순위 결과를 반환한다", async () => {
    vi.mocked(fetchAlphaVantageNewsSentiment).mockResolvedValueOnce({
      sentimentScore: 0.4,
      summary: "Alpha Vantage 기사 톤은 대체로 긍정적이야.",
      headlines: ["Bitcoin breakout gains momentum", "ETF approval keeps market optimistic"],
      eventSummary: 'Alpha Vantage 대표 헤드라인은 "Bitcoin breakout gains momentum"이고, 전체 톤은 긍정 재료가 더 강하게 읽혀.',
      source: "alpha-vantage",
    });

    const result = await fetchNewsSentiment("BTC");

    expect(result.source).toBe("alpha-vantage");
    expect(result.headlines).toHaveLength(2);
  });

  it("Alpha Vantage가 실패하면 GDELT로 넘어간다", async () => {
    vi.mocked(fetchAlphaVantageNewsSentiment).mockRejectedValueOnce(new Error("alpha failed"));
    vi.mocked(fetchGdeltNewsSentiment).mockResolvedValueOnce({
      sentimentScore: 0.1,
      summary: "GDELT 기사 톤은 중립에 가까워.",
      headlines: ["Bitcoin breakout gains momentum"],
      eventSummary: 'GDELT 대표 헤드라인은 "Bitcoin breakout gains momentum"이고, 전체 톤은 재료 방향은 아직 중립에 가까워.',
      source: "gdelt",
    });

    const result = await fetchNewsSentiment("BTC");

    expect(result.source).toBe("gdelt");
  });

  it("Alpha Vantage와 GDELT가 실패하면 NewsAPI로 넘어간다", async () => {
    vi.mocked(fetchAlphaVantageNewsSentiment).mockRejectedValueOnce(new Error("alpha failed"));
    vi.mocked(fetchGdeltNewsSentiment).mockRejectedValueOnce(new Error("gdelt failed"));
    vi.mocked(fetchNewsApiSentiment).mockResolvedValueOnce({
      sentimentScore: -0.1,
      summary: "NewsAPI 기사 톤은 중립에 가까워.",
      headlines: ["Bitcoin breakout gains momentum"],
      eventSummary: 'NewsAPI 대표 헤드라인은 "Bitcoin breakout gains momentum"이고, 전체 톤은 재료 방향은 아직 중립에 가까워.',
      source: "newsapi",
    });

    const result = await fetchNewsSentiment("BTC");

    expect(result.source).toBe("newsapi");
  });
});
