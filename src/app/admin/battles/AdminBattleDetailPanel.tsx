import { Suspense } from "react";
import type { AdminBattleDetail } from "@/app/admin/battles/adminBattles.types";
import { AdminBattleEventLog } from "@/app/admin/battles/AdminBattleEventLog";

interface AdminBattleDetailPanelProps {
  battleId: string;
  eventPage: number;
  initialDetail: AdminBattleDetail | null;
}

export function AdminBattleDetailPanel({
  battleId,
  eventPage,
  initialDetail,
}: AdminBattleDetailPanelProps) {
  return (
    <section className="rounded-[24px] border border-border bg-card p-5">
      <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">상세</h2>
      {initialDetail ? (
        <div className="mt-4 space-y-5">
          <div className="rounded-[18px] bg-[hsl(var(--surface-2))] p-4 text-sm">
            <p className="font-semibold">
              {initialDetail.battleOutcomeSeed.coinSymbol} ·{" "}
              {initialDetail.battleOutcomeSeed.battleId}
            </p>
            <p className="mt-2 text-muted-foreground">
              선택 {initialDetail.battleOutcomeSeed.userSelectedTeam} · 승리{" "}
              {initialDetail.battleOutcomeSeed.winningTeam} · userWon{" "}
              {initialDetail.battleOutcomeSeed.userWon ? "true" : "false"}
            </p>
            <p className="mt-2 text-muted-foreground">
              strongest: {initialDetail.battleOutcomeSeed.strongestWinningArgument}
            </p>
            <p className="mt-1 text-muted-foreground">
              weakest: {initialDetail.battleOutcomeSeed.weakestLosingArgument}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">배틀 리포트</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              report source: {initialDetail.reportSource}
            </p>
            <pre className="mt-3 whitespace-pre-wrap rounded-[18px] bg-[hsl(var(--surface-2))] p-4 text-sm leading-6 text-muted-foreground">
              {initialDetail.report?.report ?? "아직 report가 없어"}
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Character Memory Seeds</h3>
            <div className="mt-3 grid gap-3">
              {initialDetail.characterMemorySeeds.map((seed) => (
                <div
                  key={seed.id}
                  className="rounded-[18px] bg-[hsl(var(--surface-2))] p-4 text-sm"
                >
                  <p className="font-semibold">
                    {seed.characterName} · {seed.team} · {seed.wasCorrect ? "정답" : "오답"}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {seed.indicatorLabel} {seed.indicatorValue}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    provider {seed.provider} · model {seed.model} · fallback{" "}
                    {seed.fallbackUsed ? "true" : "false"}
                  </p>
                  <p className="mt-2 text-muted-foreground">{seed.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <Suspense
            fallback={
              <div>
                <h3 className="text-sm font-semibold">Event Log</h3>
                <div className="mt-3 grid gap-2">
                  <div className="h-20 rounded-[16px] bg-[hsl(var(--surface-2))]" />
                  <div className="h-20 rounded-[16px] bg-[hsl(var(--surface-2))]" />
                </div>
              </div>
            }
          >
            <AdminBattleEventLog battleId={battleId} page={eventPage} />
          </Suspense>
        </div>
      ) : (
        <div className="mt-4 rounded-[18px] bg-[hsl(var(--surface-2))] p-4 text-sm text-muted-foreground">
          {battleId
            ? "해당 battleId의 상세 결과를 찾지 못했어."
            : "왼쪽 최근 배틀이나 검색으로 상세를 확인해."}
        </div>
      )}
    </section>
  );
}
