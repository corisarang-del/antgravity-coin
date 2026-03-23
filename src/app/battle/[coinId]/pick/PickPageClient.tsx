"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { BattleTimeframe } from "@/domain/models/BattleTimeframe";
import type { CurrentUserSnapshot } from "@/presentation/hooks/currentUserStore";
import { AppHeader } from "@/presentation/components/AppHeader";
import { PickButton } from "@/presentation/components/PickButton";
import { RiskDisclaimer } from "@/presentation/components/RiskDisclaimer";
import { TeamSummaryCard } from "@/presentation/components/TeamSummaryCard";
import { TimeframeSelector } from "@/presentation/components/TimeframeSelector";
import { useBattleSnapshot } from "@/presentation/hooks/useBattleSnapshot";
import { useUserBattle } from "@/presentation/hooks/useUserBattle";
import { getBattleTimeframeMeta } from "@/shared/constants/battleTimeframes";
import { getBattleSettlementAt } from "@/application/useCases/fetchBattleSettlement";

interface PickPageClientProps {
  coinId: string;
  initialCurrentUserSnapshot: CurrentUserSnapshot;
}

export function PickPageClient({ coinId, initialCurrentUserSnapshot }: PickPageClientProps) {
  const router = useRouter();
  const { saveUserBattle } = useUserBattle(coinId);
  const [selectedTeam, setSelectedTeam] = useState<"bull" | "bear">("bull");
  const [timeframe, setTimeframe] = useState<BattleTimeframe>("5m");
  const snapshot = useBattleSnapshot(coinId);
  const timeframeMeta = getBattleTimeframeMeta(timeframe);

  const { bullPoints, bearPoints } = useMemo(() => {
    const snapshotMessages = snapshot?.messages ?? [];
    const nextBullPoints: string[] = [];
    const nextBearPoints: string[] = [];

    for (const message of snapshotMessages) {
      if (message.team === "bull" && nextBullPoints.length < 3) {
        nextBullPoints.push(message.summary);
      }

      if (message.team === "bear" && nextBearPoints.length < 3) {
        nextBearPoints.push(message.summary);
      }

      if (nextBullPoints.length === 3 && nextBearPoints.length === 3) {
        break;
      }
    }

    return {
      bullPoints: nextBullPoints,
      bearPoints: nextBearPoints,
    };
  }, [snapshot?.messages]);

  const handleConfirm = () => {
    const battleId = crypto.randomUUID();
    const selectedAt = new Date().toISOString();
    const persistUserBattle = async () => {
      if (snapshot?.snapshotId) {
        await fetch("/api/battle/snapshot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            snapshotId: snapshot.snapshotId,
            battleId,
            coinId,
            marketData: snapshot.marketData,
            summary: snapshot.summary,
            messages: snapshot.messages,
            savedAt: snapshot.savedAt,
          }),
        }).catch(() => undefined);
      }

      await fetch("/api/battle/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userBattle: {
            battleId,
            coinId,
            coinSymbol: snapshot?.marketData?.symbol ?? coinId.toUpperCase(),
            selectedTeam,
            timeframe,
            selectedPrice: snapshot?.marketData?.currentPrice ?? 0,
            selectedAt,
            snapshotId: snapshot?.snapshotId ?? null,
            settlementAt: getBattleSettlementAt(selectedAt, timeframe),
            priceSource: "bybit-linear",
            marketSymbol: `${snapshot?.marketData?.symbol ?? coinId.toUpperCase()}USDT`,
            settledPrice: null,
          },
        }),
      }).catch(() => undefined);

      saveUserBattle({
        battleId,
      coinId,
      coinSymbol: snapshot?.marketData?.symbol ?? coinId.toUpperCase(),
      selectedTeam,
      timeframe,
      selectedPrice: snapshot?.marketData?.currentPrice ?? 0,
      selectedAt,
      snapshotId: snapshot?.snapshotId ?? null,
      settlementAt: getBattleSettlementAt(selectedAt, timeframe),
      priceSource: "bybit-linear",
      marketSymbol: `${snapshot?.marketData?.symbol ?? coinId.toUpperCase()}USDT`,
      settledPrice: null,
      });

      router.push(`/battle/${coinId}/waiting`);
    };

    void persistUserBattle();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader initialCurrentUserSnapshot={initialCurrentUserSnapshot} />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <section className="rounded-[28px] border border-border bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_18px_44px_rgba(17,29,61,0.08)]">
          <h1 className="font-display text-4xl font-bold tracking-[-0.05em]">
            {coinId.toUpperCase()} 차트 라운드 선택
          </h1>
          <p className="ag-body-copy mt-3 text-muted-foreground">
            토론은 끝났고 이제 어느 캔들 구간에서 네 판단이 더 강할지 고르는 단계야.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <TeamSummaryCard title="불리시 팀 핵심 포인트" points={bullPoints} team="bull" />
          <TeamSummaryCard title="베어리시 팀 핵심 포인트" points={bearPoints} team="bear" />
        </section>

        <section className="rounded-[24px] border border-border bg-card p-5 shadow-[0_16px_36px_rgba(17,29,61,0.06)]">
          <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">포지션 선택</h2>
          <p className="ag-body-copy mt-2 text-muted-foreground">
            짧은 봉일수록 반응 속도 싸움이고, 긴 봉일수록 방향 유지 싸움이야.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <PickButton
              label="나는 불리시 캔들이 우세하다고 본다"
              team="bull"
              selected={selectedTeam === "bull"}
              onClick={() => setSelectedTeam("bull")}
            />
            <PickButton
              label="나는 베어리시 캔들이 우세하다고 본다"
              team="bear"
              selected={selectedTeam === "bear"}
              onClick={() => setSelectedTeam("bear")}
            />
          </div>
          <div className="mt-5">
            <p className="mb-3 text-sm font-semibold">결과를 볼 차트 구간</p>
            <TimeframeSelector value={timeframe} onChange={setTimeframe} />
            <p className="ag-body-copy mt-3 text-muted-foreground">
              현재 선택: {timeframeMeta.label} · {timeframeMeta.description}
            </p>
          </div>
          <button
            className="ag-primary-cta ag-primary-cta-text mt-5 rounded-[18px] px-4 transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary/30"
            onClick={handleConfirm}
            type="button"
          >
            차트 라운드 확정
          </button>
        </section>
        <RiskDisclaimer />
      </main>
    </div>
  );
}
