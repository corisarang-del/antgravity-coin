import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/constants/envConfig", () => ({
  envConfig: {
    alphaVantageApiKey: "token",
  },
}));

import { fetchAlphaVantageNewsSentiment } from "@/infrastructure/api/alphaVantageNewsClient";

describe("fetchAlphaVantageNewsSentiment", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("실제 응답 shape에서 감성 점수와 헤드라인 요약을 함께 만든다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          feed: [
            {
              title: "Bitcoin breakout gains momentum",
              overall_sentiment_score: "0.41",
            },
            {
              title: "ETF approval keeps market optimistic",
              overall_sentiment_score: "0.35",
            },
          ],
        }),
      }),
    );

    const result = await fetchAlphaVantageNewsSentiment("BTC");

    expect(result.sentimentScore).toBeGreaterThan(0);
    expect(result.source).toBe("alpha-vantage");
    expect(result.headlines).toHaveLength(2);
    expect(result.eventSummary).toContain("Bitcoin breakout gains momentum");
  });
});
