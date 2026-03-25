import path from "node:path";
import type { PreparedBattleContext } from "@/application/useCases/preparedBattleContext";
import { loadJsonFileStore, saveJsonFileStore } from "@/infrastructure/db/jsonFileStore";
import { runSerializedByKey } from "@/shared/utils/keyedSerialExecutor";

interface PreparedBattleContextStore {
  version: 1;
  items: PreparedBattleContext[];
}

const DATA_DIR = path.join(process.cwd(), "database", "data");
const DATA_FILE = path.join(DATA_DIR, "battle_prep_cache.json");

async function ensureStore(): Promise<PreparedBattleContextStore> {
  const parsed = await loadJsonFileStore(DATA_FILE, {
    version: 1,
    items: [],
  } satisfies PreparedBattleContextStore);

  return {
    version: 1,
    items: parsed.items ?? [],
  };
}

async function saveStore(store: PreparedBattleContextStore) {
  await saveJsonFileStore(DATA_FILE, store);
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
