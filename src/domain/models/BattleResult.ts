import { z } from "zod";
import { BattleTimeframeSchema } from "@/domain/models/BattleTimeframe";

export const BattleResultSchema = z.object({
  coinId: z.string(),
  timeframe: BattleTimeframeSchema,
  winningTeam: z.enum(["bull", "bear", "draw"]),
  priceChangePercent: z.number(),
  userWon: z.boolean(),
  xpDelta: z.number(),
  ruleVersion: z.literal("v1"),
});

export type BattleResult = z.infer<typeof BattleResultSchema>;
