import type { BattleOutcomeSeed } from "@/domain/models/BattleOutcomeSeed";
import type { CharacterMemorySeed } from "@/domain/models/CharacterMemorySeed";
import type { BattleReport } from "@/domain/models/BattleReport";
import type { PlayerDecisionSeed } from "@/domain/models/PlayerDecisionSeed";
import { synthesizeBattleReportWithGemini } from "@/infrastructure/api/geminiSynthesisClient";
import { formatBattleTimeframeLabel } from "@/shared/constants/battleTimeframes";

function buildFallbackReport(input: {
  battleOutcomeSeed: BattleOutcomeSeed;
  characterMemorySeeds: CharacterMemorySeed[];
}) {
  const correctCharacters = input.characterMemorySeeds
    .filter((seed) => seed.wasCorrect)
    .map((seed) => seed.characterName);

  return [
    `${input.battleOutcomeSeed.coinSymbol} ${formatBattleTimeframeLabel(input.battleOutcomeSeed.timeframe)} 차트 회고`,
    `승리 팀: ${input.battleOutcomeSeed.winningTeam}`,
    `플레이어 결과: ${input.battleOutcomeSeed.userWon ? "성공" : "실패"}`,
    `가장 강한 승리 논거: ${input.battleOutcomeSeed.strongestWinningArgument}`,
    `가장 약한 패배 논거: ${input.battleOutcomeSeed.weakestLosingArgument}`,
    `이번 결과에 가까웠던 캐릭터: ${correctCharacters.join(", ") || "없음"}`,
  ].join("\n");
}

export async function generateBattleReport(input: {
  battleOutcomeSeed: BattleOutcomeSeed;
  characterMemorySeeds: CharacterMemorySeed[];
  playerDecisionSeed: PlayerDecisionSeed;
}): Promise<BattleReport> {
  const synthesized = await synthesizeBattleReportWithGemini({
    battleOutcomeSeed: input.battleOutcomeSeed,
    characterMemorySeeds: input.characterMemorySeeds,
    playerDecisionSeed: input.playerDecisionSeed,
  });
  const report = synthesized ?? buildFallbackReport(input);

  return {
    id: `report:${input.battleOutcomeSeed.battleId}`,
    battleId: input.battleOutcomeSeed.battleId,
    outcomeSeedId: input.battleOutcomeSeed.id,
    report,
    reportSource: synthesized ? "gemini" : "fallback",
    createdAt: new Date().toISOString(),
  };
}
