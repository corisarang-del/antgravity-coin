import { describe, expect, it } from "vitest";
import { resolveBattle } from "@/application/useCases/resolveBattle";
import { updateLevels } from "@/application/useCases/updateLevels";

describe("resolveBattle", () => {
  it("24h 가격 상승이고 불리시 선택 시 사용자 경험치가 증가한다", () => {
    const result = resolveBattle(
      {
        battleId: crypto.randomUUID(),
        coinId: "bitcoin",
        coinSymbol: "BTC",
        selectedTeam: "bull",
        timeframe: "24h",
        selectedPrice: 84120,
        selectedAt: new Date().toISOString(),
      },
      {
        coinId: "bitcoin",
        symbol: "BTC",
        currentPrice: 84120,
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
    );

    const nextLevel = updateLevels(
      {
        level: 1,
        title: "개미",
        xp: 0,
        wins: 0,
        losses: 0,
      },
      result,
    );

    expect(result.winningTeam).toBe("bull");
    expect(result.userWon).toBe(true);
    expect(nextLevel.xp).toBeGreaterThan(0);
  });
});
