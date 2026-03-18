import type { BattleOutcomeSeed } from "@/domain/models/BattleOutcomeSeed";
import type { CharacterMemorySeed } from "@/domain/models/CharacterMemorySeed";
import type { BattleReport } from "@/domain/models/BattleReport";
import type { PlayerDecisionSeed } from "@/domain/models/PlayerDecisionSeed";
import { synthesizeBattleReportWithGemini } from "@/infrastructure/api/geminiSynthesisClient";

function buildFallbackReport(input: {
  battleOutcomeSeed: BattleOutcomeSeed;
  characterMemorySeeds: CharacterMemorySeed[];
}) {
  const correctCharacters = input.characterMemorySeeds
    .filter((seed) => seed.wasCorrect)
    .map((seed) => seed.characterName);

  return [
    `${input.battleOutcomeSeed.coinSymbol} ${input.battleOutcomeSeed.timeframe} 배틀 회고`,
    `승리 팀: ${input.battleOutcomeSeed.winningTeam}`,
    `플레이어 적중 여부: ${input.battleOutcomeSeed.userWon ? "성공" : "실패"}`,
    `가장 강했던 논거: ${input.battleOutcomeSeed.strongestWinningArgument}`,
    `약했던 반대 논거: ${input.battleOutcomeSeed.weakestLosingArgument}`,
    `이번 결과와 맞았던 캐릭터: ${correctCharacters.join(", ") || "없음"}`,
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
