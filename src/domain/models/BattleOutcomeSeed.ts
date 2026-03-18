import { z } from "zod";

export const BattleOutcomeSeedSchema = z.object({
  id: z.string(),
  battleId: z.string(),
  coinId: z.string(),
  coinSymbol: z.string(),
  timeframe: z.enum(["24h", "7d"]),
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
