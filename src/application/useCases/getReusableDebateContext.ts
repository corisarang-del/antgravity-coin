import type { ReportRepository } from "@/application/ports/ReportRepository";

export interface ReusableDebateContext {
  recentBattleLessons: string[];
  characterLessonsById: Record<string, string[]>;
}

function dedupeAndLimit(values: string[], limit: number) {
  return [...new Set(values)].slice(0, limit);
}

export async function getReusableDebateContext(
  reportRepository: ReportRepository,
  coinId: string,
): Promise<ReusableDebateContext> {
  const coinMemos = await reportRepository.listReusableMemosByCoin(coinId, 3);
  const sourceMemos =
    coinMemos.length > 0 ? coinMemos : await reportRepository.listRecentReusableMemos(3);

  const recentBattleLessons = dedupeAndLimit(
    sourceMemos.flatMap((memo) =>
      memo.globalLessons.map((lesson) => `[${memo.coinSymbol} ${memo.timeframe}] ${lesson}`),
    ),
    6,
  );

  const characterLessonsById = sourceMemos.reduce<Record<string, string[]>>((accumulator, memo) => {
    for (const lesson of memo.characterLessons) {
      if (!accumulator[lesson.characterId]) {
        accumulator[lesson.characterId] = [];
      }

      accumulator[lesson.characterId].push(
        `[${memo.coinSymbol} ${memo.timeframe}] ${lesson.lesson}`,
      );
      accumulator[lesson.characterId] = dedupeAndLimit(accumulator[lesson.characterId], 3);
    }

    return accumulator;
  }, {});

  return {
    recentBattleLessons,
    characterLessonsById,
  };
}
