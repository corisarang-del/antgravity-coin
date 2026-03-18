import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchHyperliquidPerpetualMetrics } from "@/infrastructure/api/hyperliquidClient";

describe("fetchHyperliquidPerpetualMetrics", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("실제 응답 shape에서 미결제약정, 펀딩비, 고래 점수를 읽는다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValue({
          ok: true,
          json: async () => ([
            [
              {
                name: "BTC",
              },
            ],
            [
              {
                funding: "0.000123",
                markPx: "84000",
                openInterest: "1523.5",
                dayNtlVlm: "450000000",
                premium: "0.0008",
              },
            ],
          ]),
        }),
    );

    const result = await fetchHyperliquidPerpetualMetrics("BTC");

    expect(result.openInterest).toBe(127974000);
    expect(result.fundingRate).toBe(0.0123);
    expect(result.whaleScore).toBeGreaterThan(0);
  });
});
