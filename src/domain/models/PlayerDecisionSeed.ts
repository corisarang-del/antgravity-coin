import { z } from "zod";
import { BattleTimeframeSchema } from "@/domain/models/BattleTimeframe";
import { SettlementPriceSourceSchema } from "@/domain/models/BattleSettlementSnapshot";

export const PlayerDecisionSeedSchema = z.object({
  id: z.string(),
  battleId: z.string(),
  coinId: z.string(),
  coinSymbol: z.string(),
  selectedTeam: z.enum(["bull", "bear"]),
  timeframe: BattleTimeframeSchema,
  selectedPrice: z.number(),
  snapshotId: z.string().nullable(),
  settlementAt: z.string(),
  priceSource: SettlementPriceSourceSchema,
  marketSymbol: z.string(),
  settledPrice: z.number(),
  userWon: z.boolean(),
  createdAt: z.string(),
});

export type PlayerDecisionSeed = z.infer<typeof PlayerDecisionSeedSchema>;
