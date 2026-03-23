import type { BattleOutcomeSeed } from "@/domain/models/BattleOutcomeSeed";
import type { BattleReport } from "@/domain/models/BattleReport";
import type { CharacterMemorySeed } from "@/domain/models/CharacterMemorySeed";
import type { ReusableBattleMemo } from "@/domain/models/ReusableBattleMemo";
import { formatBattleTimeframeLabel } from "@/shared/constants/battleTimeframes";
import { sanitizeDisplayText, sanitizeKoreanText } from "@/shared/utils/textIntegrity";

function winningArgumentFallback(seed: BattleOutcomeSeed) {
  return `${seed.coinSymbol} 배틀에서 불리시 진영의 핵심 논거가 정리되지 않아 기본 요약으로 대체했어.`;
}

function losingArgumentFallback(seed: BattleOutcomeSeed) {
  return `${seed.coinSymbol} 배틀에서 베어리시 진영의 핵심 논거가 정리되지 않아 기본 요약으로 대체했어.`;
}

function memorySummaryFallback(seed: CharacterMemorySeed) {
  return `${seed.characterName}의 발언 요약이 손상돼서 저장 전에 안전한 기본 문장으로 바꿨어.`;
}

function reportFallback(seed: BattleOutcomeSeed, characterMemorySeeds: CharacterMemorySeed[]) {
  const correctCharacters = characterMemorySeeds
    .filter((item) => item.wasCorrect)
    .map((item) => item.characterName)
    .join(", ");

  return [
    `${seed.coinSymbol} ${formatBattleTimeframeLabel(seed.timeframe)} 차트 결과 보고`,
    `승리 팀: ${seed.winningTeam}`,
    `플레이어 결과: ${seed.userWon ? "성공" : "실패"}`,
    `가장 강한 승리 논거: ${seed.strongestWinningArgument}`,
    `가장 약한 패배 논거: ${seed.weakestLosingArgument}`,
    `정답에 가까웠던 캐릭터: ${correctCharacters || "없음"}`,
  ].join("\n");
}

export function sanitizeBattleOutcomeSeed(seed: BattleOutcomeSeed): BattleOutcomeSeed {
  return {
    ...seed,
    strongestWinningArgument: sanitizeKoreanText(
      seed.strongestWinningArgument,
      winningArgumentFallback(seed),
    ),
    weakestLosingArgument: sanitizeKoreanText(
      seed.weakestLosingArgument,
      losingArgumentFallback(seed),
    ),
  };
}

export function sanitizeCharacterMemorySeeds(
  seeds: CharacterMemorySeed[],
): CharacterMemorySeed[] {
  return seeds.map((seed) => ({
    ...seed,
    summary: sanitizeKoreanText(seed.summary, memorySummaryFallback(seed)),
    indicatorLabel: sanitizeDisplayText(seed.indicatorLabel, "핵심 지표"),
    indicatorValue:
      typeof seed.indicatorValue === "string"
        ? sanitizeDisplayText(seed.indicatorValue, "값 없음")
        : seed.indicatorValue,
  }));
}

export function sanitizeBattleReport(
  report: BattleReport,
  battleOutcomeSeed: BattleOutcomeSeed,
  characterMemorySeeds: CharacterMemorySeed[],
): BattleReport {
  return {
    ...report,
    report: sanitizeKoreanText(
      report.report,
      reportFallback(battleOutcomeSeed, characterMemorySeeds),
    ),
  };
}

export function sanitizeReusableBattleMemo(memo: ReusableBattleMemo): ReusableBattleMemo {
  return {
    ...memo,
    reportSummary: sanitizeKoreanText(
      memo.reportSummary,
      `${memo.coinSymbol} ${formatBattleTimeframeLabel(memo.timeframe)} 차트 요약이 손상돼 기본 요약으로 대체했어.`,
    ),
    strongestWinningArgument: sanitizeKoreanText(
      memo.strongestWinningArgument,
      `${memo.coinSymbol} 배틀 승리 논거를 안전한 기본 문장으로 대체했어.`,
    ),
    weakestLosingArgument: sanitizeKoreanText(
      memo.weakestLosingArgument,
      `${memo.coinSymbol} 배틀 패배 논거를 안전한 기본 문장으로 대체했어.`,
    ),
    globalLessons: memo.globalLessons.map((lesson, index) =>
      sanitizeKoreanText(lesson, `배틀 학습 포인트 ${index + 1}가 손상돼 기본 문장으로 대체했어.`),
    ),
    characterLessons: memo.characterLessons.map((lesson) => ({
      ...lesson,
      lesson: sanitizeKoreanText(
        lesson.lesson,
        `${lesson.characterName}의 학습 메모가 손상돼 기본 문장으로 대체했어.`,
      ),
    })),
  };
}
