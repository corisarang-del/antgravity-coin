import type { BattleTimeframe } from "@/domain/models/BattleTimeframe";
import type { BattleSettlementSnapshot } from "@/domain/models/BattleSettlementSnapshot";
import type { UserBattle } from "@/domain/models/UserBattle";
import {
  fetchBybitEntryCandleClose,
  fetchBybitSettlementCandleClose,
} from "@/infrastructure/api/bybitClient";

const timeframeDurationsMs: Record<BattleTimeframe, number> = {
  "5m": 5 * 60_000,
  "30m": 30 * 60_000,
  "1h": 60 * 60_000,
  "4h": 4 * 60 * 60_000,
  "24h": 24 * 60 * 60_000,
  "7d": 7 * 24 * 60 * 60_000,
};

function roundPriceChange(value: number) {
  return Math.round(value * 100) / 100;
}

export function getBattleSettlementAt(selectedAt: string, timeframe: BattleTimeframe) {
  return new Date(Date.parse(selectedAt) + timeframeDurationsMs[timeframe]).toISOString();
}

export function isBattleSettlementReady(userBattle: UserBattle, now = new Date()) {
  return now.getTime() >= Date.parse(userBattle.settlementAt);
}

export async function fetchBattleSettlement(
  userBattle: UserBattle,
  now = new Date(),
): Promise<BattleSettlementSnapshot> {
  if (!isBattleSettlementReady(userBattle, now)) {
    return {
      battleId: userBattle.battleId,
      timeframe: userBattle.timeframe,
      settlementAt: userBattle.settlementAt,
      priceSource: userBattle.priceSource,
      marketSymbol: userBattle.marketSymbol,
      entryPrice: userBattle.selectedPrice,
      settledPrice: null,
      priceChangePercent: null,
      winningTeam: null,
      status: "pending",
    };
  }

  const [entryCandle, settlementCandle] = await Promise.all([
    fetchBybitEntryCandleClose(userBattle.marketSymbol, userBattle.selectedAt),
    fetchBybitSettlementCandleClose(
      userBattle.marketSymbol,
      userBattle.timeframe,
      userBattle.settlementAt,
    ),
  ]);

  const entryPrice = entryCandle.closePrice;
  const settledPrice = settlementCandle.closePrice;
  const rawChange = ((settledPrice - entryPrice) / entryPrice) * 100;
  const priceChangePercent = roundPriceChange(rawChange);
  const winningTeam =
    priceChangePercent === 0 ? "draw" : priceChangePercent > 0 ? "bull" : "bear";

  return {
    battleId: userBattle.battleId,
    timeframe: userBattle.timeframe,
    settlementAt: userBattle.settlementAt,
    priceSource: userBattle.priceSource,
    marketSymbol: userBattle.marketSymbol,
    entryPrice,
    settledPrice,
    priceChangePercent,
    winningTeam,
    status: "settled",
  };
}
