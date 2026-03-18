import type { BattleOutcomeSeed } from "@/domain/models/BattleOutcomeSeed";
import type { CharacterMemorySeed } from "@/domain/models/CharacterMemorySeed";
import type { PlayerDecisionSeed } from "@/domain/models/PlayerDecisionSeed";

export interface SeedRepository {
  saveBattleOutcomeSeed(seed: BattleOutcomeSeed): Promise<void>;
  saveCharacterMemorySeeds(seeds: CharacterMemorySeed[]): Promise<void>;
  savePlayerDecisionSeed(seed: PlayerDecisionSeed): Promise<void>;
  getBattleOutcomeSeed(battleId: string): Promise<BattleOutcomeSeed | null>;
  getCharacterMemorySeeds(battleId: string): Promise<CharacterMemorySeed[]>;
  getPlayerDecisionSeed(battleId: string): Promise<PlayerDecisionSeed | null>;
  listBattleOutcomeSeeds(limit?: number): Promise<BattleOutcomeSeed[]>;
}
