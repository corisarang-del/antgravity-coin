import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PreparedBattleContext } from "@/application/useCases/preparedBattleContext";
import { runSerializedByKey } from "@/shared/utils/keyedSerialExecutor";

interface PreparedBattleContextStore {
  version: 1;
  items: PreparedBattleContext[];
}

const DATA_DIR = path.join(process.cwd(), "database", "data");
const DATA_FILE = path.join(DATA_DIR, "battle_prep_cache.json");

async function ensureStore(): Promise<PreparedBattleContextStore> {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    const rawValue = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(rawValue) as Partial<PreparedBattleContextStore>;

    return {
      version: 1,
      items: parsed.items ?? [],
    };
  } catch {
    const initialValue: PreparedBattleContextStore = {
      version: 1,
      items: [],
    };
    await writeFile(DATA_FILE, JSON.stringify(initialValue, null, 2), "utf8");
    return initialValue;
  }
}

async function saveStore(store: PreparedBattleContextStore) {
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

export class FilePreparedBattleContextRepository {
  async getByCoinId(coinId: string) {
    const store = await ensureStore();
    return store.items.find((item) => item.coinId === coinId) ?? null;
  }

  async save(context: PreparedBattleContext) {
    await runSerializedByKey(DATA_FILE, async () => {
      const store = await ensureStore();
      store.items = store.items.filter((item) => item.coinId !== context.coinId);
      store.items.push(context);
      await saveStore(store);
    });
  }
}
