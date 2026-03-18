import { describe, expect, it } from "vitest";
import { buildBattleOutcomeSeed } from "@/application/useCases/buildBattleOutcomeSeed";

describe("buildBattleOutcomeSeed", () => {
  it("결과와 대표 논거를 포함한 outcome seed를 만든다", () => {
    const seed = buildBattleOutcomeSeed({
      userBattle: {
        battleId: "battle-1",
        coinId: "bitcoin",
        coinSymbol: "BTC",
        selectedTeam: "bull",
        timeframe: "24h",
        selectedPrice: 84000,
        selectedAt: new Date().toISOString(),
      },
      messages: [
        {
          id: "1",
          characterId: "aira",
          characterName: "Aira",
          team: "bull",
          stance: "bullish",
          summary: "기술 구조가 버틴다.",
          detail: "detail",
          indicatorLabel: "RSI",
          indicatorValue: "61",
          provider: "openrouter",
          model: "qwen/qwen3.5-9b",
          fallbackUsed: false,
          createdAt: new Date().toISOString(),
        },
      ],
      marketData: {
        coinId: "bitcoin",
        symbol: "BTC",
        currentPrice: 85000,
        priceChange24h: 2.4,
        priceChange7d: 5.1,
        rsi: 61,
        macd: 2.3,
        bollingerUpper: 86200,
        bollingerLower: 80100,
        fearGreedIndex: 60,
        fearGreedLabel: "Greed",
        sentimentScore: 0.4,
        longShortRatio: 1.1,
        openInterest: 125000000,
        fundingRate: 0.0123,
        whaleScore: 66,
        volume24h: 32000000000,
      },
    });

    expect(seed.winningTeam).toBe("bull");
    expect(seed.ruleVersion).toBe("v1");
    expect(seed.strongestWinningArgument).toContain("기술 구조");
  });
});
