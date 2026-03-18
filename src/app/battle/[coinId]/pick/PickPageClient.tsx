"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/presentation/components/AppHeader";
import { PickButton } from "@/presentation/components/PickButton";
import { RiskDisclaimer } from "@/presentation/components/RiskDisclaimer";
import { TeamSummaryCard } from "@/presentation/components/TeamSummaryCard";
import { TimeframeSelector } from "@/presentation/components/TimeframeSelector";
import { useBattleSnapshot } from "@/presentation/hooks/useBattleSnapshot";
import { useUserBattle } from "@/presentation/hooks/useUserBattle";

interface PickPageClientProps {
  coinId: string;
}

export function PickPageClient({ coinId }: PickPageClientProps) {
  const router = useRouter();
  const { saveUserBattle } = useUserBattle();
  const [selectedTeam, setSelectedTeam] = useState<"bull" | "bear">("bull");
  const [timeframe, setTimeframe] = useState<"24h" | "7d">("24h");
  const snapshot = useBattleSnapshot();

  const bullPoints = useMemo(
    () =>
      (snapshot?.messages ?? [])
        .filter((message) => message.team === "bull")
        .slice(0, 3)
        .map((message) => message.summary),
    [snapshot],
  );

  const bearPoints = useMemo(
    () =>
      (snapshot?.messages ?? [])
        .filter((message) => message.team === "bear")
        .slice(0, 3)
        .map((message) => message.summary),
    [snapshot],
  );

  const handleConfirm = () => {
    saveUserBattle({
      battleId: crypto.randomUUID(),
      coinId,
      coinSymbol: snapshot?.marketData?.symbol ?? coinId.toUpperCase(),
      selectedTeam,
      timeframe,
      selectedPrice: snapshot?.marketData?.currentPrice ?? 0,
      selectedAt: new Date().toISOString(),
    });

    router.push(`/battle/${coinId}/waiting`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <section className="rounded-[28px] border border-border bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_18px_44px_rgba(17,29,61,0.08)]">
          <h1 className="font-display text-4xl font-bold tracking-[-0.05em]">
            {coinId.toUpperCase()} 팀 선택
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            토론이 끝났어. 이제 어떤 논리가 더 설득력 있었는지 골라보자.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <TeamSummaryCard title="불리시 팀 요약" points={bullPoints} team="bull" />
          <TeamSummaryCard title="베어리시 팀 요약" points={bearPoints} team="bear" />
        </section>

        <section className="rounded-[24px] border border-border bg-card p-5 shadow-[0_16px_36px_rgba(17,29,61,0.06)]">
          <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">팀 선택</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            불리시는 상승 지속 가능성, 베어리시는 조정 가능성에 더 무게를 두는 선택이야.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <PickButton
              label="나는 불리시 팀이 맞다고 본다"
              team="bull"
              selected={selectedTeam === "bull"}
              onClick={() => setSelectedTeam("bull")}
            />
            <PickButton
              label="나는 베어리시 팀이 맞다고 본다"
              team="bear"
              selected={selectedTeam === "bear"}
              onClick={() => setSelectedTeam("bear")}
            />
          </div>
          <div className="mt-5">
            <p className="mb-3 text-sm font-semibold">결과 확인 기준</p>
            <TimeframeSelector value={timeframe} onChange={setTimeframe} />
          </div>
          <button
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-[18px] bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-[0_12px_24px_rgba(17,29,61,0.16)] transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary/30"
            onClick={handleConfirm}
            type="button"
          >
            선택 확정
          </button>
        </section>
        <RiskDisclaimer />
      </main>
    </div>
  );
}
