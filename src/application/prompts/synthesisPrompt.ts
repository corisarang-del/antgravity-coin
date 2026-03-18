import type { BattleOutcomeSeed } from "@/domain/models/BattleOutcomeSeed";
import type { CharacterMemorySeed } from "@/domain/models/CharacterMemorySeed";
import type { PlayerDecisionSeed } from "@/domain/models/PlayerDecisionSeed";

export function buildSynthesisPrompt(input: {
  battleOutcomeSeed: BattleOutcomeSeed;
  characterMemorySeeds: CharacterMemorySeed[];
  playerDecisionSeed: PlayerDecisionSeed;
}) {
  return [
    "너는 최종 결과 취합 에이전트다.",
    "이미 계산된 승패를 바꾸지 말고, 승부 근거를 재정리하고 플레이어 회고를 작성해.",
    `배틀: ${input.battleOutcomeSeed.coinSymbol} ${input.battleOutcomeSeed.timeframe}`,
    `승리 팀: ${input.battleOutcomeSeed.winningTeam}`,
    `플레이어 선택: ${input.playerDecisionSeed.selectedTeam}`,
    `플레이어 적중 여부: ${input.playerDecisionSeed.userWon ? "성공" : "실패"}`,
    `대표 승리 논거: ${input.battleOutcomeSeed.strongestWinningArgument}`,
    `대표 패배 논거: ${input.battleOutcomeSeed.weakestLosingArgument}`,
    `캐릭터 메모리: ${input.characterMemorySeeds.map((seed) => `${seed.characterName}:${seed.summary}`).join(" | ")}`,
    "출력은 일반 텍스트 report 한 덩어리로만 작성해.",
  ].join("\n");
}
