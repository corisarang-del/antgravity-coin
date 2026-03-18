import { z } from "zod";

export const ReusableBattleCharacterLessonSchema = z.object({
  characterId: z.string(),
  characterName: z.string(),
  lesson: z.string(),
  wasCorrect: z.boolean(),
});

export const ReusableBattleMemoSchema = z.object({
  id: z.string(),
  battleId: z.string(),
  coinId: z.string(),
  coinSymbol: z.string(),
  timeframe: z.enum(["24h", "7d"]),
  reportSource: z.enum(["gemini", "fallback"]),
  reportSummary: z.string(),
  winningTeam: z.enum(["bull", "bear", "draw"]),
  strongestWinningArgument: z.string(),
  weakestLosingArgument: z.string(),
  globalLessons: z.array(z.string()),
  characterLessons: z.array(ReusableBattleCharacterLessonSchema),
  createdAt: z.string(),
});

export type ReusableBattleCharacterLesson = z.infer<typeof ReusableBattleCharacterLessonSchema>;
export type ReusableBattleMemo = z.infer<typeof ReusableBattleMemoSchema>;
