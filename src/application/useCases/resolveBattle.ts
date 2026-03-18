import type { BattleResult } from "@/domain/models/BattleResult";
import type { MarketData } from "@/domain/models/MarketData";
import type { UserBattle } from "@/domain/models/UserBattle";

export function resolveBattle(userBattle: UserBattle, marketData: MarketData): BattleResult {
  const priceChangePercent =
    userBattle.timeframe === "24h" ? marketData.priceChange24h : marketData.priceChange7d;

  const winningTeam =
    priceChangePercent === 0 ? "draw" : priceChangePercent > 0 ? "bull" : "bear";
  const userWon = winningTeam !== "draw" && winningTeam === userBattle.selectedTeam;
  const xpDelta = winningTeam === "draw" ? 0 : userWon ? 24 : -12;

  return {
    coinId: userBattle.coinId,
    timeframe: userBattle.timeframe,
    winningTeam,
    priceChangePercent,
    userWon,
    xpDelta,
    ruleVersion: "v1",
  };
}
