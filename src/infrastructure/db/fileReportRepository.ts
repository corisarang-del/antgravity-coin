import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ReportRepository } from "@/application/ports/ReportRepository";
import type { BattleReport } from "@/domain/models/BattleReport";

interface ReportStore {
  reports: BattleReport[];
}

const DATA_DIR = path.join(process.cwd(), "database", "data");
const DATA_FILE = path.join(DATA_DIR, "report_store.json");

async function ensureStore(): Promise<ReportStore> {
  await mkdir(DATA_DIR, { recursive: true });

  try {
    const rawValue = await readFile(DATA_FILE, "utf8");
    return JSON.parse(rawValue) as ReportStore;
  } catch {
    const initialValue: ReportStore = { reports: [] };
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
}
