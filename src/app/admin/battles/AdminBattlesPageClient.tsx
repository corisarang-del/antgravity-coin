"use client";

import { useMemo, useState } from "react";

interface BattleListItem {
  battleId: string;
  coinId: string;
  coinSymbol: string;
  timeframe: "24h" | "7d";
  winningTeam: "bull" | "bear" | "draw";
  priceChangePercent: number;
  userWon: boolean;
  ruleVersion: "v1";
  createdAt: string;
  hasReport: boolean;
  reportSource: "gemini" | "fallback";
}

interface AdminBattleDetail {
  battleOutcomeSeed: {
    battleId: string;
    coinId: string;
    coinSymbol: string;
    timeframe: "24h" | "7d";
    winningTeam: "bull" | "bear" | "draw";
    priceChangePercent: number;
    userSelectedTeam: "bull" | "bear";
    userWon: boolean;
    strongestWinningArgument: string;
    weakestLosingArgument: string;
    ruleVersion: "v1";
    createdAt: string;
  };
  characterMemorySeeds: Array<{
    id: string;
    characterName: string;
    team: "bull" | "bear";
    indicatorLabel: string;
    indicatorValue: string;
    summary: string;
    provider: string;
    model: string;
    fallbackUsed: boolean;
    wasCorrect: boolean;
  }>;
  playerDecisionSeed: {
    selectedTeam: "bull" | "bear";
    selectedPrice: number;
  } | null;
  report: {
    report: string;
  } | null;
  reportSource: "gemini" | "fallback";
  events: Array<{
    id: string;
    type: string;
    createdAt: string;
    payload?: Record<string, unknown>;
  }>;
}

interface AdminBattlesPageClientProps {
  initialBattles: BattleListItem[];
  initialDetail: AdminBattleDetail | null;
  initialBattleId: string;
}

export function AdminBattlesPageClient({
  initialBattles,
  initialDetail,
  initialBattleId,
}: AdminBattlesPageClientProps) {
  const [battleId, setBattleId] = useState(initialBattleId);

  const selectedBattle = useMemo(
    () => initialBattles.find((battle) => battle.battleId === battleId) ?? null,
    [battleId, initialBattles],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border bg-card p-6 shadow-[0_18px_40px_rgba(17,29,61,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Internal Only
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.05em]">운영자 배틀 대시보드</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          운영 배포 전에는 반드시 접근 제어를 추가해야 해. 지금은 내부 점검용 조회 페이지야.
        </p>
      </section>

      <section className="rounded-[24px] border border-border bg-card p-5">
        <label className="block text-sm font-semibold" htmlFor="battle-id-search">
          battleId 검색
        </label>
        <form className="mt-3 flex flex-wrap gap-3" method="GET">
          <input
            className="min-w-[18rem] flex-1 rounded-[16px] border border-input bg-background px-4 py-3 text-sm"
            defaultValue={battleId}
            id="battle-id-search"
            name="battleId"
            onChange={(event) => setBattleId(event.target.value)}
            placeholder="battleId를 입력해"
          />
          <button
            className="inline-flex min-h-11 items-center rounded-[16px] bg-primary px-4 py-3 font-semibold text-primary-foreground"
            type="submit"
          >
            조회
          </button>
        </form>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[24px] border border-border bg-card p-5">
          <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">최근 배틀</h2>
          <div className="mt-4 grid gap-3">
            {initialBattles.map((battle) => (
              <a
                key={battle.battleId}
                className={`rounded-[18px] border px-4 py-4 text-sm ${battleId === battle.battleId ? "border-primary bg-[hsl(var(--surface-2))]" : "border-border bg-background"}`}
                href={`/admin/battles?battleId=${encodeURIComponent(battle.battleId)}`}
              >
                <p className="font-semibold">
                  {battle.coinSymbol} · {battle.timeframe}
                </p>
                <p className="mt-1 text-muted-foreground">{battle.battleId}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  승리 팀 {battle.winningTeam} · 변화율 {battle.priceChangePercent.toFixed(2)}% ·
                  rule {battle.ruleVersion} · report {battle.reportSource}
                </p>
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-border bg-card p-5">
          <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">상세</h2>
          {initialDetail ? (
            <div className="mt-4 space-y-5">
              <div className="rounded-[18px] bg-[hsl(var(--surface-2))] p-4 text-sm">
                <p className="font-semibold">
                  {initialDetail.battleOutcomeSeed.coinSymbol} · {initialDetail.battleOutcomeSeed.battleId}
                </p>
                <p className="mt-2 text-muted-foreground">
                  선택 {initialDetail.battleOutcomeSeed.userSelectedTeam} · 승리 {initialDetail.battleOutcomeSeed.winningTeam} ·
                  userWon {initialDetail.battleOutcomeSeed.userWon ? "true" : "false"}
                </p>
                <p className="mt-2 text-muted-foreground">
                  strongest: {initialDetail.battleOutcomeSeed.strongestWinningArgument}
                </p>
                <p className="mt-1 text-muted-foreground">
                  weakest: {initialDetail.battleOutcomeSeed.weakestLosingArgument}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold">배틀 회고</h3>
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
                    <div key={seed.id} className="rounded-[18px] bg-[hsl(var(--surface-2))] p-4 text-sm">
                      <p className="font-semibold">
                        {seed.characterName} · {seed.team} · {seed.wasCorrect ? "정답" : "오답"}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {seed.indicatorLabel} {seed.indicatorValue}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        provider {seed.provider} · model {seed.model} · fallback {seed.fallbackUsed ? "true" : "false"}
                      </p>
                      <p className="mt-2 text-muted-foreground">{seed.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Event Log</h3>
                <div className="mt-3 grid gap-2">
                  {initialDetail.events.map((event) => (
                    <div key={event.id} className="rounded-[16px] bg-[hsl(var(--surface-2))] px-4 py-3 text-sm">
                      <p className="font-semibold">{event.type}</p>
                      <p className="text-muted-foreground">{event.createdAt}</p>
                      {event.payload ? (
                        <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-[18px] bg-[hsl(var(--surface-2))] p-4 text-sm text-muted-foreground">
              {selectedBattle
                ? "이 battleId의 상세 저장 결과를 찾지 못했어."
                : "왼쪽 최근 배틀이나 검색으로 상세를 확인해."}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
