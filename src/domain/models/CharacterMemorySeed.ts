import { z } from "zod";

export const CharacterMemorySeedSchema = z.object({
  id: z.string(),
  battleId: z.string(),
  coinId: z.string(),
  characterId: z.string(),
  characterName: z.string(),
  team: z.enum(["bull", "bear"]),
  stance: z.enum(["bullish", "bearish", "neutral"]),
  indicatorLabel: z.string(),
  indicatorValue: z.string(),
  summary: z.string(),
  provider: z.string(),
  model: z.string(),
  fallbackUsed: z.boolean(),
  wasCorrect: z.boolean(),
  createdAt: z.string(),
});

export type CharacterMemorySeed = z.infer<typeof CharacterMemorySeedSchema>;
