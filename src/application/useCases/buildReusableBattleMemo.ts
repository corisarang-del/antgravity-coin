import type { BattleOutcomeSeed } from "@/domain/models/BattleOutcomeSeed";
import type { BattleReport } from "@/domain/models/BattleReport";
import type { CharacterMemorySeed } from "@/domain/models/CharacterMemorySeed";
import type { ReusableBattleMemo } from "@/domain/models/ReusableBattleMemo";
import type { GeminiBattleLessons } from "@/infrastructure/api/geminiSynthesisClient";

function buildReportSummary(report: string) {
  const firstLine = report
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  if (!firstLine) {
    return "요약 없음";
  }

  return firstLine.length > 140 ? `${firstLine.slice(0, 137)}...` : firstLine;
}

export function buildReusableBattleMemo(input: {
  battleOutcomeSeed: BattleOutcomeSeed;
  characterMemorySeeds: CharacterMemorySeed[];
  report: BattleReport;
  synthesizedLessons?: GeminiBattleLessons | null;
}): ReusableBattleMemo {
  const reportSummary =
    input.synthesizedLessons?.reportSummary || buildReportSummary(input.report.report);
  const globalLessons =
    input.synthesizedLessons?.globalLessons.length
      ? input.synthesizedLessons.globalLessons
      : [
          `이번 ${input.battleOutcomeSeed.coinSymbol} ${input.battleOutcomeSeed.timeframe} 배틀 승리 팀은 ${input.battleOutcomeSeed.winningTeam}였어.`,
          `가장 강한 승리 근거는 "${input.battleOutcomeSeed.strongestWinningArgument}"였어.`,
          `가장 약한 패배 근거는 "${input.battleOutcomeSeed.weakestLosingArgument}"였어.`,
          `최종 리포트 요약: ${reportSummary}`,
        ];
  const characterLessons =
    input.synthesizedLessons?.characterLessons.length
      ? input.synthesizedLessons.characterLessons
      : input.characterMemorySeeds.map((seed) => ({
          characterId: seed.characterId,
          characterName: seed.characterName,
          wasCorrect: seed.wasCorrect,
          lesson: seed.wasCorrect
            ? `${seed.characterName}의 관점은 이번엔 결과와 맞았어. 핵심 주장: ${seed.summary}`
            : `${seed.characterName}의 관점은 이번엔 결과와 어긋났어. 다시 볼 주장: ${seed.summary}`,
        }));

  return {
    id: `memo:${input.battleOutcomeSeed.battleId}`,
    battleId: input.battleOutcomeSeed.battleId,
    coinId: input.battleOutcomeSeed.coinId,
    coinSymbol: input.battleOutcomeSeed.coinSymbol,
    timeframe: input.battleOutcomeSeed.timeframe,
    reportSource: input.report.reportSource,
    reportSummary,
    winningTeam: input.battleOutcomeSeed.winningTeam,
    strongestWinningArgument: input.battleOutcomeSeed.strongestWinningArgument,
    weakestLosingArgument: input.battleOutcomeSeed.weakestLosingArgument,
    globalLessons,
    characterLessons,
    createdAt: new Date().toISOString(),
  };
}
