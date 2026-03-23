import { describe, expect, it } from "vitest";
import { resolveBattle } from "@/application/useCases/resolveBattle";
import { updateLevels } from "@/application/useCases/updateLevels";

describe("resolveBattle", () => {
  it("실정산 가격 상승이고 불리시 선택 시 사용자 경험치가 증가한다", () => {
    const result = resolveBattle(
      {
        battleId: crypto.randomUUID(),
        coinId: "bitcoin",
        coinSymbol: "BTC",
        selectedTeam: "bull",
        timeframe: "24h",
        selectedPrice: 84120,
        selectedAt: "2026-03-20T00:00:00.000Z",
        snapshotId: "snapshot-1",
        settlementAt: "2026-03-21T00:00:00.000Z",
        priceSource: "bybit-linear",
        marketSymbol: "BTCUSDT",
        settledPrice: null,
      },
      {
        battleId: crypto.randomUUID(),
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
