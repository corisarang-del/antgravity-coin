import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BattleSnapshotRecord } from "@/domain/models/BattleSnapshotRecord";
import { runSerializedByKey } from "@/shared/utils/keyedSerialExecutor";

interface BattleSnapshotStore {
  items: BattleSnapshotRecord[];
}

const DATA_DIR = path.join(process.cwd(), "database", "data");
const DATA_FILE = path.join(DATA_DIR, "battle_snapshot_store.json");

async function ensureStore(): Promise<BattleSnapshotStore> {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    const rawValue = await readFile(DATA_FILE, "utf8");
    return JSON.parse(rawValue) as BattleSnapshotStore;
  } catch {
    const initialValue: BattleSnapshotStore = { items: [] };
    await writeFile(DATA_FILE, JSON.stringify(initialValue, null, 2), "utf8");
    return initialValue;
  }
}

async function saveStore(store: BattleSnapshotStore) {
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

export class FileBattleSnapshotRepository {
  async saveSnapshot(snapshot: BattleSnapshotRecord) {
    await runSerializedByKey(DATA_FILE, async () => {
      const store = await ensureStore();
      store.items = store.items.filter((item) => item.snapshotId !== snapshot.snapshotId);
      store.items.push(snapshot);
      await saveStore(store);
    });
  }

  async getSnapshot(snapshotId: string) {
    const store = await ensureStore();
    return store.items.find((item) => item.snapshotId === snapshotId) ?? null;
  }

  async getSnapshotForUser(snapshotId: string, userId: string) {
    const store = await ensureStore();
    return store.items.find((item) => item.snapshotId === snapshotId && item.userId === userId) ?? null;
  }

  async getSnapshotByBattleId(battleId: string) {
    const store = await ensureStore();
    return (
      [...store.items]
        .filter((item) => item.battleId === battleId)
        .sort((left, right) => right.savedAt.localeCompare(left.savedAt))[0] ?? null
    );
  }

  async getSnapshotByBattleIdForUser(battleId: string, userId: string) {
    const store = await ensureStore();
    return (
      [...store.items]
        .filter((item) => item.battleId === battleId && item.userId === userId)
        .sort((left, right) => right.savedAt.localeCompare(left.savedAt))[0] ?? null
    );
  }
}
