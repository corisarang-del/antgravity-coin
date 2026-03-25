import path from "node:path";
import type { EventLog, EventLogEntry } from "@/application/ports/EventLog";
import { loadJsonFileStore, saveJsonFileStore } from "@/infrastructure/db/jsonFileStore";
import { runSerializedByKey } from "@/shared/utils/keyedSerialExecutor";

interface StoredEventLog {
  items: EventLogEntry[];
}

const DATA_DIR = path.join(process.cwd(), "database", "data");
const DATA_FILE = path.join(DATA_DIR, "event_log.json");

async function ensureStore(): Promise<StoredEventLog> {
  return loadJsonFileStore(DATA_FILE, { items: [] } satisfies StoredEventLog);
}

async function saveStore(store: StoredEventLog) {
  await saveJsonFileStore(DATA_FILE, store);
}

export class FileEventLog implements EventLog {
  async append<TPayload>(entry: EventLogEntry<TPayload>) {
    await runSerializedByKey(DATA_FILE, async () => {
      const store = await ensureStore();
      if (store.items.some((item) => item.id === entry.id)) {
        return;
      }

      store.items.push(entry as EventLogEntry);
      await saveStore(store);
    });
  }

  async list() {
    const store = await ensureStore();
    return store.items;
  }

  async listByBattleId(battleId: string) {
    const store = await ensureStore();
    return store.items.filter((item) => item.battleId === battleId);
  }
}
