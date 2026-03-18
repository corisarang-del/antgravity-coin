"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { resolveBattle } from "@/application/useCases/resolveBattle";
import { updateLevels } from "@/application/useCases/updateLevels";
import { AppHeader } from "@/presentation/components/AppHeader";
import { CharacterLevelChange } from "@/presentation/components/CharacterLevelChange";
import { RiskDisclaimer } from "@/presentation/components/RiskDisclaimer";
import { UserLevelChange } from "@/presentation/components/UserLevelChange";
import { VerdictBanner } from "@/presentation/components/VerdictBanner";
import { WinnerHighlight } from "@/presentation/components/WinnerHighlight";
import { useBattleSnapshot } from "@/presentation/hooks/useBattleSnapshot";
import { useCurrentUser } from "@/presentation/hooks/useCurrentUser";
import { useUserBattle } from "@/presentation/hooks/useUserBattle";
import { useUserLevelStore } from "@/presentation/stores/userLevelStore";

interface ResultPageClientProps {
  coinId: string;
}

export function ResultPageClient({ coinId }: ResultPageClientProps) {
  const { userBattle } = useUserBattle();
  const snapshot = useBattleSnapshot();
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { userLevel, hydrated, hydratedUserId, hydrateUserLevel, setUserLevel } =
    useUserLevelStore();
  const [battleReport, setBattleReport] = useState<string | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);
  const battleId = userBattle?.battleId;

  const battleResult =
    userBattle && snapshot?.marketData ? resolveBattle(userBattle, snapshot.marketData) : null;

  useEffect(() => {
    if (user?.userId && (!hydrated || hydratedUserId !== user.userId)) {
      hydrateUserLevel(user.userId);
    }
  }, [hydrateUserLevel, hydrated, hydratedUserId, user?.userId]);

  useEffect(() => {
    if (!battleResult || !userBattle || !hydrated || !user?.userId || !battleId) {
      return;
    }

    const currentBattleResult = battleResult;
    const currentBattle = userBattle;
    const currentUserId = user.userId;
    const currentSnapshot = snapshot;
    let cancelled = false;

    async function applyBattleResult() {
      if (!currentSnapshot) {
        return;
      }

      const battleIdQuery = encodeURIComponent(currentBattle.battleId);
      const [appliedResponse, existingOutcomeResponse] = await Promise.all([
        fetch(`/api/battle/applications?battleId=${battleIdQuery}`, {
          credentials: "include",
        }),
        fetch(`/api/battle/outcome?battleId=${battleIdQuery}`, {
          credentials: "include",
        }),
      ]);

      const appliedData = (await appliedResponse.json()) as { applied: boolean };
      const existingOutcomeData = existingOutcomeResponse.ok
        ? ((await existingOutcomeResponse.json()) as { report?: { report: string } })
        : null;

      if (cancelled) {
        return;
      }

      if (existingOutcomeData?.report?.report) {
        startTransition(() => {
          setBattleReport(existingOutcomeData.report?.report ?? null);
        });
      }

      if (appliedData.applied) {
        return;
      }

      const outcomeResponse = await fetch("/api/battle/outcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userBattle: currentBattle,
          marketData: currentSnapshot.marketData,
          messages: currentSnapshot.messages,
        }),
      });

      if (outcomeResponse.ok) {
        const outcomeData = (await outcomeResponse.json()) as { report?: { report: string } };
        if (!cancelled) {
          startTransition(() => {
            setBattleReport(outcomeData.report?.report ?? null);
          });
        }
      } else {
        if (!cancelled) {
          setResultError("결과 저장이 아직 끝나지 않았어. 잠시 후 다시 시도해줘.");
        }
        return;
      }

      const markAppliedResponse = await fetch("/api/battle/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          battleId: currentBattle.battleId,
        }),
      });

      if (!markAppliedResponse.ok) {
        if (!cancelled) {
          setResultError("결과 반영 기록 저장에 실패했어. 다시 시도해줘.");
        }
        return;
      }

      const nextLevel = updateLevels(userLevel, currentBattleResult);
      setUserLevel(currentUserId, nextLevel);
    }

    void applyBattleResult();

    return () => {
      cancelled = true;
    };
  }, [battleId, battleResult, hydrated, setUserLevel, snapshot, user?.userId, userBattle, userLevel]);

  if (!battleResult || !snapshot?.messages || !userBattle || userBattle.coinId !== coinId) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <main className="mx-auto max-w-4xl px-4 py-6">
          <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_40px_rgba(17,29,61,0.08)]">
            <h1 className="font-display text-3xl font-bold tracking-[-0.05em]">결과를 계산할 수 없어</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              결과를 계산할 데이터가 부족하다.
            </p>
            <Link
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-[18px] bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-[0_12px_24px_rgba(17,29,61,0.16)] transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary/30"
              href={`/battle/${coinId}/pick`}
            >
              다시 선택하러 가기
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const previewLevel = battleResult ? updateLevels(userLevel, battleResult) : userLevel;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        {isUserLoading ? (
          <p className="rounded-[20px] border border-border bg-[hsl(var(--surface-2))] px-4 py-3 text-sm text-muted-foreground">
            사용자 정보를 확인하는 중이야.
          </p>
        ) : null}
        <VerdictBanner battleResult={battleResult} />
        {resultError ? (
          <p className="rounded-[20px] border border-bear/20 bg-bear/10 px-4 py-3 text-sm text-bear">
            {resultError}
          </p>
        ) : null}
        <UserLevelChange battleResult={battleResult} userLevel={previewLevel} />
        <CharacterLevelChange winningTeam={battleResult.winningTeam} />
        <WinnerHighlight messages={snapshot.messages} winningTeam={battleResult.winningTeam} />
        {battleReport ? (
          <section className="rounded-[24px] border border-border bg-card p-5">
            <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">배틀 회고</h2>
            <pre className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {battleReport}
            </pre>
          </section>
        ) : null}
        <RiskDisclaimer />
      </main>
    </div>
  );
}
