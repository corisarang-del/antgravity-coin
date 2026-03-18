import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ReportRepository } from "@/application/ports/ReportRepository";
import type { BattleReport } from "@/domain/models/BattleReport";
import type { ReusableBattleMemo } from "@/domain/models/ReusableBattleMemo";

interface ReportStore {
  reports: BattleReport[];
  reusableMemos: ReusableBattleMemo[];
}

const DATA_DIR = path.join(process.cwd(), "database", "data");
const DATA_FILE = path.join(DATA_DIR, "report_store.json");

async function ensureStore(): Promise<ReportStore> {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    const rawValue = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(rawValue) as Partial<ReportStore>;

    return {
      reports: parsed.reports ?? [],
      reusableMemos: parsed.reusableMemos ?? [],
    };
  } catch {
    const initialValue: ReportStore = { reports: [], reusableMemos: [] };
    await writeFile(DATA_FILE, JSON.stringify(initialValue, null, 2), "utf8");
    return initialValue;
  }
}

async function saveStore(store: ReportStore) {
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

export class FileReportRepository implements ReportRepository {
  async saveReport(report: BattleReport) {
    const store = await ensureStore();
    store.reports = store.reports.filter((item) => item.id !== report.id);
    store.reports.push(report);
    await saveStore(store);
  }

  async getByBattleId(battleId: string) {
    const store = await ensureStore();
    return store.reports.find((report) => report.battleId === battleId) ?? null;
  }

  async saveReusableMemo(memo: ReusableBattleMemo) {
    const store = await ensureStore();
    store.reusableMemos = store.reusableMemos.filter((item) => item.id !== memo.id);
    store.reusableMemos.push(memo);
    await saveStore(store);
  }

  async getReusableMemoByBattleId(battleId: string) {
    const store = await ensureStore();
    return store.reusableMemos.find((memo) => memo.battleId === battleId) ?? null;
  }

  async listReusableMemosByCoin(coinId: string, limit = 3) {
    const store = await ensureStore();
    return [...store.reusableMemos]
      .filter((memo) => memo.coinId === coinId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, limit);
  }

  async listRecentReusableMemos(limit = 3) {
    const store = await ensureStore();
    return [...store.reusableMemos]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, limit);
  }
}
