import { z } from "zod";
import { BattleTimeframeSchema } from "@/domain/models/BattleTimeframe";
import { SettlementPriceSourceSchema } from "@/domain/models/BattleSettlementSnapshot";

export const UserBattleSchema = z.object({
  battleId: z.string().uuid(),
  coinId: z.string(),
  coinSymbol: z.string(),
  selectedTeam: z.enum(["bull", "bear"]),
  timeframe: BattleTimeframeSchema,
  selectedPrice: z.number(),
  selectedAt: z.string(),
  snapshotId: z.string().nullable(),
  settlementAt: z.string(),
  priceSource: SettlementPriceSourceSchema,
  marketSymbol: z.string(),
  settledPrice: z.number().nullable(),
});

export type UserBattle = z.infer<typeof UserBattleSchema>;
