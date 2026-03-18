import { AdminBattlesPageClient } from "@/app/admin/battles/AdminBattlesPageClient";
import { FileEventLog } from "@/infrastructure/db/fileEventLog";
import { FileReportRepository } from "@/infrastructure/db/fileReportRepository";
import { FileSeedRepository } from "@/infrastructure/db/fileSeedRepository";

interface AdminBattlesPageProps {
  searchParams: Promise<{
    battleId?: string;
  }>;
}

export default async function AdminBattlesPage({ searchParams }: AdminBattlesPageProps) {
  const { battleId = "" } = await searchParams;
  const seedRepository = new FileSeedRepository();
  const reportRepository = new FileReportRepository();
  const eventLog = new FileEventLog();

  const initialBattleSeeds = await seedRepository.listBattleOutcomeSeeds(20);
  const initialBattles = await Promise.all(
    initialBattleSeeds.map(async (battle) => {
      const report = await reportRepository.getByBattleId(battle.battleId);

      return {
        battleId: battle.battleId,
        coinId: battle.coinId,
        coinSymbol: battle.coinSymbol,
        timeframe: battle.timeframe,
        winningTeam: battle.winningTeam,
        priceChangePercent: battle.priceChangePercent,
        userWon: battle.userWon,
        ruleVersion: battle.ruleVersion,
        createdAt: battle.createdAt,
        hasReport: report !== null,
        reportSource: report?.reportSource ?? "fallback",
      };
    }),
  );

  const initialDetail = battleId
    ? await (async () => {
        const battleOutcomeSeed = await seedRepository.getBattleOutcomeSeed(battleId);
        if (!battleOutcomeSeed) {
          return null;
        }

        const [characterMemorySeeds, playerDecisionSeed, report, events] = await Promise.all([
          seedRepository.getCharacterMemorySeeds(battleId),
          seedRepository.getPlayerDecisionSeed(battleId),
          reportRepository.getByBattleId(battleId),
          eventLog.listByBattleId(battleId),
        ]);

        return {
          battleOutcomeSeed,
          characterMemorySeeds,
          playerDecisionSeed,
          report,
          reportSource: report?.reportSource ?? "fallback",
          events,
        };
      })()
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-6">
        <AdminBattlesPageClient
          initialBattleId={battleId}
          initialBattles={initialBattles}
          initialDetail={initialDetail}
        />
      </main>
    </div>
  );
}
