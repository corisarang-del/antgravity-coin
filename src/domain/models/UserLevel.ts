import { z } from "zod";

export const UserLevelSchema = z.object({
  level: z.number().min(1),
  title: z.string(),
  xp: z.number().min(0),
  wins: z.number().min(0),
  losses: z.number().min(0),
});

export type UserLevel = z.infer<typeof UserLevelSchema>;
