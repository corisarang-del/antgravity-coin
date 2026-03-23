import { beforeEach, describe, expect, it, vi } from "vitest";

const prewarmPreparedBattleContext = vi.fn();

vi.mock("@/application/useCases/preparedBattleContext", () => ({
  prewarmPreparedBattleContext,
}));

describe("prewarmMarketCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prewarm을 제한된 동시성으로 처리한다", async () => {
    let activeCount = 0;
    let maxActiveCount = 0;

    prewarmPreparedBattleContext.mockImplementation(async (coinId: string) => {
      activeCount += 1;
      maxActiveCount = Math.max(maxActiveCount, activeCount);

      await new Promise((resolve) => setTimeout(resolve, 5));

      activeCount -= 1;

      return {
        context: {
          coinId,
          marketData: {
            coinId,
            symbol: coinId.slice(0, 3).toUpperCase(),
          },
        },
        preparedContextHit: false,
        preparedFirstTurnHit: false,
        preparedAtAgeMs: 0,
        refreshQueued: false,
      };
    });

    const { prewarmMarketCache } = await import("@/application/useCases/prewarmMarketCache");
    const results = await prewarmMarketCache(["bitcoin", "ethereum", "xrp", "solana"]);

    expect(results).toHaveLength(4);
    expect(maxActiveCount).toBeLessThanOrEqual(2);
  });
});
