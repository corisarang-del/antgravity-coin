import path from "node:path";
import type { SeedRepository } from "@/application/ports/SeedRepository";
import type { BattleOutcomeSeed } from "@/domain/models/BattleOutcomeSeed";
import type { CharacterMemorySeed } from "@/domain/models/CharacterMemorySeed";
import type { PlayerDecisionSeed } from "@/domain/models/PlayerDecisionSeed";
import { loadJsonFileStore, saveJsonFileStore } from "@/infrastructure/db/jsonFileStore";
import { runSerializedByKey } from "@/shared/utils/keyedSerialExecutor";

interface SeedStore {
  battleOutcomeSeeds: BattleOutcomeSeed[];
  characterMemorySeeds: CharacterMemorySeed[];
  playerDecisionSeeds: PlayerDecisionSeed[];
}

const DATA_DIR = path.join(process.cwd(), "database", "data");
const DATA_FILE = path.join(DATA_DIR, "seed_store.json");

async function ensureStore(): Promise<SeedStore> {
  return loadJsonFileStore(DATA_FILE, {
    battleOutcomeSeeds: [],
    characterMemorySeeds: [],
    playerDecisionSeeds: [],
  } satisfies SeedStore);
}

async function saveStore(store: SeedStore) {
  await saveJsonFileStore(DATA_FILE, store);
}

export class FileSeedRepository implements SeedRepository {
  async saveBattleOutcomeSeed(seed: BattleOutcomeSeed) {
    await runSerializedByKey(DATA_FILE, async () => {
      const store = await ensureStore();
      store.battleOutcomeSeeds = store.battleOutcomeSeeds.filter((item) => item.id !== seed.id);
      store.battleOutcomeSeeds.push(seed);
      await saveStore(store);
    });
  }

  async saveCharacterMemorySeeds(seeds: CharacterMemorySeed[]) {
    await runSerializedByKey(DATA_FILE, async () => {
      const store = await ensureStore();
      const incomingIds = new Set(seeds.map((seed) => seed.id));
      store.characterMemorySeeds = store.characterMemorySeeds.filter(
        (seed) => !incomingIds.has(seed.id),
      );
      store.characterMemorySeeds.push(...seeds);
      await saveStore(store);
    });
  }

  async savePlayerDecisionSeed(seed: PlayerDecisionSeed) {
    await runSerializedByKey(DATA_FILE, async () => {
      const store = await ensureStore();
      store.playerDecisionSeeds = store.playerDecisionSeeds.filter((item) => item.id !== seed.id);
      store.playerDecisionSeeds.push(seed);
      await saveStore(store);
    });
  }

  async getBattleOutcomeSeed(battleId: string) {
    const store = await ensureStore();
    return store.battleOutcomeSeeds.find((seed) => seed.battleId === battleId) ?? null;
  }

  async getCharacterMemorySeeds(battleId: string) {
    const store = await ensureStore();
    return store.characterMemorySeeds.filter((seed) => seed.battleId === battleId);
  }

  async getPlayerDecisionSeed(battleId: string) {
    const store = await ensureStore();
    return store.playerDecisionSeeds.find((seed) => seed.battleId === battleId) ?? null;
  }

  async listBattleOutcomeSeeds(limit = 20) {
    const store = await ensureStore();
    return [...store.battleOutcomeSeeds]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, limit);
  }
}
