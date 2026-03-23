import type { BattleResult } from "@/domain/models/BattleResult";
import type { UserLevel } from "@/domain/models/UserLevel";
import { mapXpToUserLevel } from "@/infrastructure/mappers/levelMapper";

export function updateLevels(currentUserLevel: UserLevel, battleResult: BattleResult) {
  const wins = currentUserLevel.wins + (battleResult.userWon ? 1 : 0);
  const losses = currentUserLevel.losses + (battleResult.userWon ? 0 : 1);
  const nextXp = currentUserLevel.xp + battleResult.xpDelta;

  return mapXpToUserLevel(nextXp, wins, losses);
}
