import { describe, expect, it } from "vitest";
import { buildBattleOutcomeSeed } from "@/application/useCases/buildBattleOutcomeSeed";

describe("buildBattleOutcomeSeed", () => {
  it("정산 스냅샷을 포함한 outcome seed를 만든다", () => {
    const seed = buildBattleOutcomeSeed({
      userBattle: {
        battleId: "battle-1",
        coinId: "bitcoin",
        coinSymbol: "BTC",
        selectedTeam: "bull",
        timeframe: "24h",
        selectedPrice: 84000,
        selectedAt: "2026-03-20T00:00:00.000Z",
        snapshotId: "snapshot-1",
        settlementAt: "2026-03-21T00:00:00.000Z",
        priceSource: "bybit-linear",
        marketSymbol: "BTCUSDT",
        settledPrice: null,
      },
      messages: [
        {
          id: "1",
          characterId: "aira",
          characterName: "Aira",
          team: "bull",
          stance: "bullish",
          summary: "기술 구조가 살아 있어.",
          detail: "detail",
          indicatorLabel: "RSI",
          indicatorValue: "61",
          provider: "openrouter",
          model: "qwen/qwen3.5-9b",
          fallbackUsed: false,
          createdAt: new Date().toISOString(),
        },
      ],
      settlementSnapshot: {
        battleId: "battle-1",
        timeframe: "24h",
        settlementAt: "2026-03-21T00:00:00.000Z",
        priceSource: "bybit-linear",
        marketSymbol: "BTCUSDT",
        entryPrice: 84000,
        settledPrice: 86000,
        priceChangePercent: 2.38,
        winningTeam: "bull",
        status: "settled",
      },
    });

    expect(seed.winningTeam).toBe("bull");
    expect(seed.settledPrice).toBe(86000);
    expect(seed.marketSymbol).toBe("BTCUSDT");
  });
});
