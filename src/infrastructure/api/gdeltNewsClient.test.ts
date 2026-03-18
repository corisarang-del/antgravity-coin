import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchGdeltNewsSentiment } from "@/infrastructure/api/gdeltNewsClient";

describe("fetchGdeltNewsSentiment", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("실제 응답 shape에서 기사 제목 기반 감성 점수를 계산한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          articles: [
            { title: "Bitcoin breakout gains momentum" },
            { title: "Adoption rally boosts BTC sentiment" },
          ],
        }),
      }),
    );

    const result = await fetchGdeltNewsSentiment("BTC");

    expect(result.sentimentScore).toBeGreaterThan(0);
    expect(result.source).toBe("gdelt");
  });
});
