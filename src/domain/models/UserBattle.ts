import { z } from "zod";

export const UserBattleSchema = z.object({
  battleId: z.string().uuid(),
  coinId: z.string(),
  coinSymbol: z.string(),
  selectedTeam: z.enum(["bull", "bear"]),
  timeframe: z.enum(["24h", "7d"]),
  selectedPrice: z.number(),
  selectedAt: z.string(),
});

export type UserBattle = z.infer<typeof UserBattleSchema>;
