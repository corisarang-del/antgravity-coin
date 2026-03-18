import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { EventLog, EventLogEntry } from "@/application/ports/EventLog";

interface StoredEventLog {
  items: EventLogEntry[];
}

const DATA_DIR = path.join(process.cwd(), "database", "data");
const DATA_FILE = path.join(DATA_DIR, "event_log.json");

async function ensureStore(): Promise<StoredEventLog> {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    const rawValue = await readFile(DATA_FILE, "utf8");
    return JSON.parse(rawValue) as StoredEventLog;
  } catch {
    const initialValue: StoredEventLog = { items: [] };
    await writeFile(DATA_FILE, JSON.stringify(initialValue, null, 2), "utf8");
    return initialValue;
  }
}

async function saveStore(store: StoredEventLog) {
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

export class FileEventLog implements EventLog {
  async append<TPayload>(entry: EventLogEntry<TPayload>) {
    const store = await ensureStore();
    if (store.items.some((item) => item.id === entry.id)) {
      return;
    }

    store.items.push(entry as EventLogEntry);
    await saveStore(store);
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
