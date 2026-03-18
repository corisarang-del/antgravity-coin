import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchBybitLongShortRatio } from "@/infrastructure/api/bybitClient";

describe("fetchBybitLongShortRatio", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("실제 응답 shape에서 롱숏 비율을 계산한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          result: {
            list: [
              {
                buyRatio: "0.56",
                sellRatio: "0.44",
              },
            ],
          },
        }),
      }),
    );

    const result = await fetchBybitLongShortRatio("BTC");

    expect(result).toBe(1.27);
  });
});
