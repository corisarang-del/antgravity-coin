import type { DebateMessage } from "@/domain/models/DebateMessage";
import type { BattleOutcomeSeed } from "@/domain/models/BattleOutcomeSeed";
import type { CharacterMemorySeed } from "@/domain/models/CharacterMemorySeed";
import type { PlayerDecisionSeed } from "@/domain/models/PlayerDecisionSeed";
import type { UserBattle } from "@/domain/models/UserBattle";

function buildCharacterMemorySeed(
  battleOutcomeSeed: BattleOutcomeSeed,
  message: DebateMessage,
): CharacterMemorySeed {
  const wasCorrect =
    battleOutcomeSeed.winningTeam !== "draw" && message.team === battleOutcomeSeed.winningTeam;

  return {
    id: `memory:${battleOutcomeSeed.battleId}:${message.characterId}`,
    battleId: battleOutcomeSeed.battleId,
    coinId: battleOutcomeSeed.coinId,
    characterId: message.characterId,
    characterName: message.characterName,
    team: message.team,
    stance: message.stance,
    indicatorLabel: message.indicatorLabel,
    indicatorValue: message.indicatorValue,
    summary: message.summary,
    provider: message.provider,
    model: message.model,
    fallbackUsed: message.fallbackUsed,
    wasCorrect,
    createdAt: new Date().toISOString(),
  };
}

function buildPlayerDecisionSeed(
  battleOutcomeSeed: BattleOutcomeSeed,
  userBattle: UserBattle,
): PlayerDecisionSeed {
  return {
    id: `decision:${battleOutcomeSeed.battleId}`,
    battleId: battleOutcomeSeed.battleId,
    coinId: battleOutcomeSeed.coinId,
    coinSymbol: battleOutcomeSeed.coinSymbol,
    selectedTeam: userBattle.selectedTeam,
    timeframe: userBattle.timeframe,
    selectedPrice: userBattle.selectedPrice,
    userWon: battleOutcomeSeed.userWon,
    createdAt: new Date().toISOString(),
  };
}

export function buildMemorySeeds(input: {
  battleOutcomeSeed: BattleOutcomeSeed;
  messages: DebateMessage[];
  userBattle: UserBattle;
}) {
  return {
    characterMemorySeeds: input.messages.map((message) =>
      buildCharacterMemorySeed(input.battleOutcomeSeed, message),
    ),
    playerDecisionSeed: buildPlayerDecisionSeed(input.battleOutcomeSeed, input.userBattle),
  };
}
