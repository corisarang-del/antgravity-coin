import { z } from "zod";

export const PlayerDecisionSeedSchema = z.object({
  id: z.string(),
  battleId: z.string(),
  coinId: z.string(),
  coinSymbol: z.string(),
  selectedTeam: z.enum(["bull", "bear"]),
  timeframe: z.enum(["24h", "7d"]),
  selectedPrice: z.number(),
  userWon: z.boolean(),
  createdAt: z.string(),
});

export type PlayerDecisionSeed = z.infer<typeof PlayerDecisionSeedSchema>;
