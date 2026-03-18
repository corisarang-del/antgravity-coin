import { z } from "zod";

export const BattleReportSchema = z.object({
  id: z.string(),
  battleId: z.string(),
  outcomeSeedId: z.string(),
  report: z.string(),
  reportSource: z.enum(["gemini", "fallback"]),
  createdAt: z.string(),
});

export type BattleReport = z.infer<typeof BattleReportSchema>;
