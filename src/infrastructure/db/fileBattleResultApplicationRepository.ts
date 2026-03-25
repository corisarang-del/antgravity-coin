import path from "node:path";
import type {
  BattleResultApplication,
  BattleResultApplicationRepository,
} from "@/application/ports/BattleResultApplicationRepository";
import { loadJsonFileStore, saveJsonFileStore } from "@/infrastructure/db/jsonFileStore";
import { runSerializedByKey } from "@/shared/utils/keyedSerialExecutor";

interface StoredApplications {
  items: BattleResultApplication[];
}

const DATA_DIR = path.join(process.cwd(), "database", "data");
const DATA_FILE = path.join(DATA_DIR, "battle_result_applications.json");

async function ensureStore(): Promise<StoredApplications> {
  return loadJsonFileStore(DATA_FILE, { items: [] } satisfies StoredApplications);
}

async function saveStore(store: StoredApplications) {
  await saveJsonFileStore(DATA_FILE, store);
}

export class FileBattleResultApplicationRepository
  implements BattleResultApplicationRepository
{
  async hasApplied(battleId: string, userId: string): Promise<boolean> {
    const store = await ensureStore();
    return store.items.some((item) => item.battleId === battleId && item.userId === userId);
  }

  async markApplied(input: BattleResultApplication): Promise<void> {
    await runSerializedByKey(DATA_FILE, async () => {
      const store = await ensureStore();
      const alreadyExists = store.items.some(
        (item) => item.battleId === input.battleId && item.userId === input.userId,
      );

      if (alreadyExists) {
        return;
      }

      store.items.push(input);
      await saveStore(store);
    });
  }
}
