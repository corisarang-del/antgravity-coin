import { z } from "zod";

export const BattleResultSchema = z.object({
  coinId: z.string(),
  timeframe: z.enum(["24h", "7d"]),
  winningTeam: z.enum(["bull", "bear", "draw"]),
  priceChangePercent: z.number(),
  userWon: z.boolean(),
  xpDelta: z.number(),
  ruleVersion: z.literal("v1"),
});

export type BattleResult = z.infer<typeof BattleResultSchema>;
