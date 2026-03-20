import { describe, expect, it } from "vitest";
import { buildMemorySeeds } from "@/application/useCases/buildMemorySeeds";

describe("buildMemorySeeds", () => {
  it("캐릭터 메모리와 플레이어 선택 seed를 정산 필드까지 포함해 만든다", () => {
    const result = buildMemorySeeds({
      battleOutcomeSeed: {
        id: "outcome:battle-1",
        battleId: "battle-1",
        coinId: "bitcoin",
        coinSymbol: "BTC",
        timeframe: "24h",
        settlementAt: "2026-03-21T00:00:00.000Z",
        priceSource: "bybit-linear",
        marketSymbol: "BTCUSDT",
        settledPrice: 86000,
        winningTeam: "bull",
        priceChangePercent: 2.4,
        userSelectedTeam: "bull",
        userWon: true,
        strongestWinningArgument: "상승 모멘텀이 강했어.",
        weakestLosingArgument: "하락 전환 근거가 약했어.",
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
    });

    expect(result.characterMemorySeeds).toHaveLength(1);
    expect(result.characterMemorySeeds[0]?.wasCorrect).toBe(true);
    expect(result.playerDecisionSeed.marketSymbol).toBe("BTCUSDT");
    expect(result.playerDecisionSeed.snapshotId).toBe("snapshot-1");
    expect(result.playerDecisionSeed.settledPrice).toBe(86000);
  });
});
