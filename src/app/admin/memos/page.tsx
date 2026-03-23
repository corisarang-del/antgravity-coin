import { AdminSectionNav } from "@/app/admin/AdminSectionNav";
import { AdminMemoSearchForm } from "@/app/admin/memos/AdminMemoSearchForm";
import Link from "next/link";
import type { ReusableBattleMemo } from "@/domain/models/ReusableBattleMemo";
import { FileReportRepository } from "@/infrastructure/db/fileReportRepository";

interface AdminMemosPageProps {
  searchParams: Promise<{
    battleId?: string;
  }>;
}

export default async function AdminMemosPage({ searchParams }: AdminMemosPageProps) {
  const { battleId = "" } = await searchParams;
  const reportRepository = new FileReportRepository();
  const recentMemos = await reportRepository.listRecentReusableMemos(20);
  const selectedMemo = battleId
    ? await reportRepository.getReusableMemoByBattleId(battleId)
    : recentMemos[0] ?? null;

  const memoList = recentMemos as ReusableBattleMemo[];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0_18px_40px_rgba(17,29,61,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Internal Only
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.05em]">
              재사용 메모 아카이브
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Gemini 리포트에서 뽑은 공용 lesson과 캐릭터별 lesson을 따로 모아 보는 화면이야.
            </p>
            <div className="mt-5">
              <AdminSectionNav active="memos" />
            </div>
          </section>

          <AdminMemoSearchForm initialBattleId={battleId} />

          <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[24px] border border-border bg-card p-5">
              <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">최근 메모</h2>
              <div className="mt-4 grid gap-3">
                {memoList.map((memo) => (
                  <Link
                    key={memo.id}
                    className={`rounded-[18px] border px-4 py-4 text-sm ${
                      selectedMemo?.battleId === memo.battleId
                        ? "border-primary bg-[hsl(var(--surface-2))]"
                        : "border-border bg-background"
                    }`}
                    href={`/admin/memos?battleId=${encodeURIComponent(memo.battleId)}`}
                  >
                    <p className="font-semibold">
                      {memo.coinSymbol} · {memo.timeframe}
                    </p>
                    <p className="mt-1 break-all text-muted-foreground">{memo.battleId}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      승리 팀 {memo.winningTeam} · source {memo.reportSource}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {memo.reportSummary}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-border bg-card p-5">
              <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">메모 상세</h2>
              {selectedMemo ? (
                <div className="mt-4 space-y-5">
                  <div className="rounded-[18px] bg-[hsl(var(--surface-2))] p-4 text-sm">
                    <p className="font-semibold">
                      {selectedMemo.coinSymbol} · {selectedMemo.timeframe} · {selectedMemo.battleId}
                    </p>
                    <p className="mt-2 text-muted-foreground">
                      승리 팀 {selectedMemo.winningTeam}
                    </p>
                    <p className="mt-2 text-muted-foreground">
                      strongest: {selectedMemo.strongestWinningArgument}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      weakest: {selectedMemo.weakestLosingArgument}
                    </p>
                  </div>

                  <div className="rounded-[18px] bg-[hsl(var(--surface-2))] p-4 text-sm">
                    <p className="font-semibold">요약</p>
                    <p className="mt-2 text-muted-foreground">{selectedMemo.reportSummary}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">공용 lesson</h3>
                    <ul className="mt-3 grid gap-2">
                      {selectedMemo.globalLessons.map((lesson) => (
                        <li
                          key={lesson}
                          className="rounded-[16px] bg-[hsl(var(--surface-2))] px-4 py-3 text-sm text-muted-foreground"
                        >
                          {lesson}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">캐릭터별 lesson</h3>
                    <div className="mt-3 grid gap-3">
                      {selectedMemo.characterLessons.map((lesson) => (
                        <div
                          key={`${lesson.characterId}:${lesson.lesson}`}
                          className="rounded-[18px] bg-[hsl(var(--surface-2))] p-4 text-sm"
                        >
                          <p className="font-semibold">
                            {lesson.characterName} · {lesson.wasCorrect ? "맞은 관점" : "빗나간 관점"}
                          </p>
                          <p className="mt-2 text-muted-foreground">{lesson.lesson}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-[18px] bg-[hsl(var(--surface-2))] p-4 text-sm text-muted-foreground">
                  아직 저장된 재사용 메모가 없어.
                </div>
              )}
            </section>
          </section>
        </div>
      </main>
    </div>
  );
}
