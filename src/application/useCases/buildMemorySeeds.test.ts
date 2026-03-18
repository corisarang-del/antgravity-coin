import { describe, expect, it } from "vitest";
import { buildMemorySeeds } from "@/application/useCases/buildMemorySeeds";

describe("buildMemorySeeds", () => {
  it("캐릭터 메모리와 플레이어 선택 seed를 함께 만든다", () => {
    const result = buildMemorySeeds({
      battleOutcomeSeed: {
        id: "outcome:battle-1",
        battleId: "battle-1",
        coinId: "bitcoin",
        coinSymbol: "BTC",
        timeframe: "24h",
        winningTeam: "bull",
        priceChangePercent: 2.4,
        userSelectedTeam: "bull",
        userWon: true,
        strongestWinningArgument: "상승",
        weakestLosingArgument: "하락",
        ruleVersion: "v1",
        createdAt: new Date().toISOString(),
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
      userBattle: {
        battleId: "battle-1",
        coinId: "bitcoin",
        coinSymbol: "BTC",
        selectedTeam: "bull",
        timeframe: "24h",
        selectedPrice: 84000,
        selectedAt: new Date().toISOString(),
      },
    });

    expect(result.characterMemorySeeds).toHaveLength(1);
    expect(result.characterMemorySeeds[0]?.wasCorrect).toBe(true);
    expect(result.playerDecisionSeed.selectedTeam).toBe("bull");
  });
});
