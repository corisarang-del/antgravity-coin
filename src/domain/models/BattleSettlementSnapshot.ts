import { z } from "zod";
import { BattleTimeframeSchema } from "@/domain/models/BattleTimeframe";

export const SettlementPriceSourceSchema = z.enum(["bybit-linear"]);

export const BattleSettlementSnapshotSchema = z.object({
  battleId: z.string(),
  timeframe: BattleTimeframeSchema,
  settlementAt: z.string(),
  priceSource: SettlementPriceSourceSchema,
  marketSymbol: z.string(),
  entryPrice: z.number(),
  settledPrice: z.number().nullable(),
  priceChangePercent: z.number().nullable(),
  winningTeam: z.enum(["bull", "bear", "draw"]).nullable(),
  status: z.enum(["pending", "settled"]),
});

export type SettlementPriceSource = z.infer<typeof SettlementPriceSourceSchema>;
export type BattleSettlementSnapshot = z.infer<typeof BattleSettlementSnapshotSchema>;
