import type { BattleSettlementSnapshot } from "@/domain/models/BattleSettlementSnapshot";
import type { BattleResult } from "@/domain/models/BattleResult";
import type { UserBattle } from "@/domain/models/UserBattle";

export function resolveBattle(
  userBattle: UserBattle,
  settlementSnapshot: BattleSettlementSnapshot,
): BattleResult {
  if (settlementSnapshot.status !== "settled" || settlementSnapshot.priceChangePercent === null) {
    throw new Error("battle_settlement_not_ready");
  }

  const winningTeam = settlementSnapshot.winningTeam ?? "draw";
  const userWon = winningTeam !== "draw" && winningTeam === userBattle.selectedTeam;
  const xpDelta = winningTeam === "draw" ? 0 : userWon ? 24 : -12;

  return {
    coinId: userBattle.coinId,
    timeframe: userBattle.timeframe,
    winningTeam,
    priceChangePercent: settlementSnapshot.priceChangePercent,
    userWon,
    xpDelta,
    ruleVersion: "v1",
  };
}
