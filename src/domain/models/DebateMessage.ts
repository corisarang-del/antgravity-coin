import { z } from "zod";

export const DebateMessageSchema = z.object({
  id: z.string(),
  characterId: z.string(),
  characterName: z.string(),
  team: z.enum(["bull", "bear"]),
  stance: z.enum(["bullish", "bearish", "neutral"]),
  summary: z.string(),
  detail: z.string(),
  indicatorLabel: z.string(),
  indicatorValue: z.string(),
  provider: z.string(),
  model: z.string(),
  fallbackUsed: z.boolean(),
  createdAt: z.string(),
});

export type DebateMessage = z.infer<typeof DebateMessageSchema>;
