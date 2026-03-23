import dynamic from "next/dynamic";
import Link from "next/link";
import { AdminSectionNav } from "@/app/admin/AdminSectionNav";
import { AdminBattleSearchForm } from "@/app/admin/battles/AdminBattleSearchForm";
import type { BattleListItem } from "@/app/admin/battles/adminBattles.types";
import { FileReportRepository } from "@/infrastructure/db/fileReportRepository";
import { FileSeedRepository } from "@/infrastructure/db/fileSeedRepository";

const AdminBattleDetailPanel = dynamic(
  () =>
    import("@/app/admin/battles/AdminBattleDetailPanel").then(
      (module) => module.AdminBattleDetailPanel,
    ),
  {
    loading: () => (
      <section className="rounded-[24px] border border-border bg-card p-5">
        <div className="h-8 w-24 rounded-full bg-[hsl(var(--surface-2))]" />
        <div className="mt-4 grid gap-3">
          <div className="h-28 rounded-[18px] bg-[hsl(var(--surface-2))]" />
          <div className="h-36 rounded-[18px] bg-[hsl(var(--surface-2))]" />
          <div className="h-44 rounded-[18px] bg-[hsl(var(--surface-2))]" />
        </div>
      </section>
    ),
  },
);

interface AdminBattlesPageProps {
  searchParams: Promise<{
    battleId?: string;
    eventPage?: string;
  }>;
}

export default async function AdminBattlesPage({ searchParams }: AdminBattlesPageProps) {
  const { battleId = "", eventPage } = await searchParams;
  const parsedEventPage = Number.parseInt(eventPage ?? "1", 10);
  const currentEventPage = Number.isFinite(parsedEventPage) && parsedEventPage > 0 ? parsedEventPage : 1;
  const seedRepository = new FileSeedRepository();
  const reportRepository = new FileReportRepository();

  const initialBattleSeeds = await seedRepository.listBattleOutcomeSeeds(20);
  const initialBattles: BattleListItem[] = await Promise.all(
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

        const [characterMemorySeeds, playerDecisionSeed, report, reusableMemo] = await Promise.all([
          seedRepository.getCharacterMemorySeeds(battleId),
          seedRepository.getPlayerDecisionSeed(battleId),
          reportRepository.getByBattleId(battleId),
          reportRepository.getReusableMemoByBattleId(battleId),
        ]);

        return {
          battleOutcomeSeed,
          characterMemorySeeds,
          playerDecisionSeed,
          report,
          reportSource: report?.reportSource ?? "fallback",
          reusableMemo: reusableMemo
            ? {
                reportSummary: reusableMemo.reportSummary,
                globalLessons: reusableMemo.globalLessons,
                characterLessons: reusableMemo.characterLessons,
              }
            : null,
        };
      })()
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0_18px_40px_rgba(17,29,61,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Internal Only
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.05em]">
              운영자 배틀 대시보드
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              운영 배틀 결과와 리포트, 이벤트 로그를 조회하는 내부 페이지야.
            </p>
            <div className="mt-5">
              <AdminSectionNav active="battles" />
            </div>
          </section>

          <AdminBattleSearchForm initialBattleId={battleId} />

          <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[24px] border border-border bg-card p-5">
              <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">최근 배틀</h2>
              <div className="mt-4 grid gap-3">
                {initialBattles.map((battle) => (
                  <Link
                    key={battle.battleId}
                    className={`rounded-[18px] border px-4 py-4 text-sm ${
                      battleId === battle.battleId
                        ? "border-primary bg-[hsl(var(--surface-2))]"
                        : "border-border bg-background"
                    }`}
                    href={`/admin/battles?battleId=${encodeURIComponent(battle.battleId)}`}
                  >
                    <p className="font-semibold">
                      {battle.coinSymbol} · {battle.timeframe}
                    </p>
                    <p className="mt-1 break-all text-muted-foreground">{battle.battleId}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      승리 팀 {battle.winningTeam} · 변동률 {battle.priceChangePercent.toFixed(2)}%
                      · rule {battle.ruleVersion} · report {battle.reportSource}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
            <AdminBattleDetailPanel
              battleId={battleId}
              eventPage={currentEventPage}
              initialDetail={initialDetail}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
