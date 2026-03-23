import { z } from "zod";
import { BattleTimeframeSchema } from "@/domain/models/BattleTimeframe";
import { SettlementPriceSourceSchema } from "@/domain/models/BattleSettlementSnapshot";

export const BattleOutcomeSeedSchema = z.object({
  id: z.string(),
  battleId: z.string(),
  coinId: z.string(),
  coinSymbol: z.string(),
  timeframe: BattleTimeframeSchema,
  settlementAt: z.string(),
  priceSource: SettlementPriceSourceSchema,
  marketSymbol: z.string(),
  settledPrice: z.number(),
  winningTeam: z.enum(["bull", "bear", "draw"]),
  priceChangePercent: z.number(),
  userSelectedTeam: z.enum(["bull", "bear"]),
  userWon: z.boolean(),
  strongestWinningArgument: z.string(),
  weakestLosingArgument: z.string(),
  ruleVersion: z.literal("v1"),
  createdAt: z.string(),
});

export type BattleOutcomeSeed = z.infer<typeof BattleOutcomeSeedSchema>;
