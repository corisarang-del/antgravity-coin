import type { BattleReport } from "@/domain/models/BattleReport";

export interface ReportRepository {
  saveReport(report: BattleReport): Promise<void>;
  getByBattleId(battleId: string): Promise<BattleReport | null>;
}
