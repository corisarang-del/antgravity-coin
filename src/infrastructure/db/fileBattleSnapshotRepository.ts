import path from "node:path";
import type { BattleSnapshotRecord } from "@/domain/models/BattleSnapshotRecord";
import { loadJsonFileStore, saveJsonFileStore } from "@/infrastructure/db/jsonFileStore";
import { runSerializedByKey } from "@/shared/utils/keyedSerialExecutor";

interface BattleSnapshotStore {
  items: BattleSnapshotRecord[];
}

const DATA_DIR = path.join(process.cwd(), "database", "data");
const DATA_FILE = path.join(DATA_DIR, "battle_snapshot_store.json");

async function ensureStore(): Promise<BattleSnapshotStore> {
  return loadJsonFileStore(DATA_FILE, { items: [] } satisfies BattleSnapshotStore);
}

async function saveStore(store: BattleSnapshotStore) {
  await saveJsonFileStore(DATA_FILE, store);
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
