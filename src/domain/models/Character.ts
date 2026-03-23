import { z } from "zod";

export const CharacterSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  specialty: z.string(),
  team: z.enum(["bull", "bear"]),
  emoji: z.string(),
  level: z.number().min(1).max(10).default(1),
  winRate: z.number().min(0).max(100).default(50),
});

export type CharacterModel = z.infer<typeof CharacterSchema>;
