import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SeedRepository } from "@/application/ports/SeedRepository";
import type { BattleOutcomeSeed } from "@/domain/models/BattleOutcomeSeed";
import type { CharacterMemorySeed } from "@/domain/models/CharacterMemorySeed";
import type { PlayerDecisionSeed } from "@/domain/models/PlayerDecisionSeed";
import { runSerializedByKey } from "@/shared/utils/keyedSerialExecutor";

interface SeedStore {
  battleOutcomeSeeds: BattleOutcomeSeed[];
  characterMemorySeeds: CharacterMemorySeed[];
  playerDecisionSeeds: PlayerDecisionSeed[];
}

const DATA_DIR = path.join(process.cwd(), "database", "data");
const DATA_FILE = path.join(DATA_DIR, "seed_store.json");

async function ensureStore(): Promise<SeedStore> {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    const rawValue = await readFile(DATA_FILE, "utf8");
    return JSON.parse(rawValue) as SeedStore;
  } catch {
    const initialValue: SeedStore = {
      battleOutcomeSeeds: [],
      characterMemorySeeds: [],
      playerDecisionSeeds: [],
    };
    await writeFile(DATA_FILE, JSON.stringify(initialValue, null, 2), "utf8");
    return initialValue;
  }
}

async function saveStore(store: SeedStore) {
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
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
