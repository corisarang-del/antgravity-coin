import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  BattleResultApplication,
  BattleResultApplicationRepository,
} from "@/application/ports/BattleResultApplicationRepository";

interface StoredApplications {
  items: BattleResultApplication[];
}

const DATA_DIR = path.join(process.cwd(), "database", "data");
const DATA_FILE = path.join(DATA_DIR, "battle_result_applications.json");

async function ensureStore(): Promise<StoredApplications> {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    const rawValue = await readFile(DATA_FILE, "utf8");
    return JSON.parse(rawValue) as StoredApplications;
  } catch {
    const initialValue: StoredApplications = { items: [] };
    await writeFile(DATA_FILE, JSON.stringify(initialValue, null, 2), "utf8");
    return initialValue;
  }
}

async function saveStore(store: StoredApplications) {
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

export class FileBattleResultApplicationRepository
  implements BattleResultApplicationRepository
{
  async hasApplied(battleId: string, userId: string): Promise<boolean> {
    const store = await ensureStore();
    return store.items.some((item) => item.battleId === battleId && item.userId === userId);
  }

  async markApplied(input: BattleResultApplication): Promise<void> {
    const store = await ensureStore();
    const alreadyExists = store.items.some(
      (item) => item.battleId === input.battleId && item.userId === input.userId,
    );

    if (alreadyExists) {
      return;
    }

    store.items.push(input);
    await saveStore(store);
  }
}
