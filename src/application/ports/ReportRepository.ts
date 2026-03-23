import type { BattleReport } from "@/domain/models/BattleReport";
import type { ReusableBattleMemo } from "@/domain/models/ReusableBattleMemo";

export interface ReportRepository {
  saveReport(report: BattleReport): Promise<void>;
  getByBattleId(battleId: string): Promise<BattleReport | null>;
  saveReusableMemo(memo: ReusableBattleMemo): Promise<void>;
  getReusableMemoByBattleId(battleId: string): Promise<ReusableBattleMemo | null>;
  listReusableMemosByCoin(coinId: string, limit?: number): Promise<ReusableBattleMemo[]>;
  listRecentReusableMemos(limit?: number): Promise<ReusableBattleMemo[]>;
}
