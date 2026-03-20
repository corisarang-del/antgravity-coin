"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { updateLevels } from "@/application/useCases/updateLevels";
import type { BattleOutcomeSeed } from "@/domain/models/BattleOutcomeSeed";
import type { BattleResult } from "@/domain/models/BattleResult";
import type { CurrentUserSnapshot } from "@/presentation/hooks/currentUserStore";
import { AppHeader } from "@/presentation/components/AppHeader";
import { CharacterLevelChange } from "@/presentation/components/CharacterLevelChange";
import { CountdownTimer } from "@/presentation/components/CountdownTimer";
import { RiskDisclaimer } from "@/presentation/components/RiskDisclaimer";
import { UserLevelChange } from "@/presentation/components/UserLevelChange";
import { VerdictBanner } from "@/presentation/components/VerdictBanner";
import { WinnerHighlight } from "@/presentation/components/WinnerHighlight";
import { useBattleSnapshot } from "@/presentation/hooks/useBattleSnapshot";
import { useCurrentUser } from "@/presentation/hooks/useCurrentUser";
import { useUserBattle } from "@/presentation/hooks/useUserBattle";
import { useUserLevelStore } from "@/presentation/stores/userLevelStore";
import { getBattleTimeframeMeta } from "@/shared/constants/battleTimeframes";
import { storageKeys } from "@/shared/constants/storageKeys";

interface ResultPageClientProps {
  coinId: string;
  initialCurrentUserSnapshot: CurrentUserSnapshot;
}

function readAppliedBattleResults() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    const rawValue = window.localStorage.getItem(storageKeys.appliedBattleResults);
    return new Set(rawValue ? (JSON.parse(rawValue) as string[]) : []);
  } catch {
    return new Set<string>();
  }
}

function markBattleResultApplied(battleId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const appliedBattleResults = readAppliedBattleResults();
  appliedBattleResults.add(battleId);
  window.localStorage.setItem(
    storageKeys.appliedBattleResults,
    JSON.stringify([...appliedBattleResults]),
  );
}

function toBattleResult(outcomeSeed: BattleOutcomeSeed): BattleResult {
  const xpDelta =
    outcomeSeed.winningTeam === "draw" ? 0 : outcomeSeed.userWon ? 24 : -12;

  return {
    coinId: outcomeSeed.coinId,
    timeframe: outcomeSeed.timeframe,
    winningTeam: outcomeSeed.winningTeam,
    priceChangePercent: outcomeSeed.priceChangePercent,
    userWon: outcomeSeed.userWon,
    xpDelta,
    ruleVersion: outcomeSeed.ruleVersion,
  };
}

function isSettlementPending(settlementAt: string) {
  return Date.now() < Date.parse(settlementAt);
}

function getRemainingSeconds(settlementAt: string) {
  return Math.max(0, Math.ceil((Date.parse(settlementAt) - Date.now()) / 1000));
}

export function ResultPageClient({
  coinId,
  initialCurrentUserSnapshot,
}: ResultPageClientProps) {
  const { userBattle } = useUserBattle(coinId);
  const snapshot = useBattleSnapshot(coinId);
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const { userLevel, hydrated, hydratedUserId, hydrateUserLevel, setUserLevel } =
    useUserLevelStore();
  const [battleOutcomeSeed, setBattleOutcomeSeed] = useState<BattleOutcomeSeed | null>(null);
  const [battleReport, setBattleReport] = useState<string | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const battleId = userBattle?.battleId ?? null;
  const settlementPending = userBattle ? isSettlementPending(userBattle.settlementAt) : false;
  const battleResult = useMemo(
    () => (battleOutcomeSeed ? toBattleResult(battleOutcomeSeed) : null),
    [battleOutcomeSeed],
  );

  useEffect(() => {
    if (user?.userId && (!hydrated || hydratedUserId !== user.userId)) {
      hydrateUserLevel(user.userId);
    }
  }, [hydrateUserLevel, hydrated, hydratedUserId, user?.userId]);

  useEffect(() => {
    if (!userBattle || !battleId || settlementPending) {
      return;
    }

    const nextBattleId = battleId;
    const nextUserBattle = userBattle;

    let cancelled = false;

    async function resolveBattleOutcome() {
      setIsResolving(true);
      setResultError(null);

      const battleIdQuery = encodeURIComponent(nextBattleId);
      const existingOutcomeResponse = await fetch(`/api/battle/outcome?battleId=${battleIdQuery}`, {
        credentials: "include",
      });

      if (existingOutcomeResponse.ok) {
        const data = (await existingOutcomeResponse.json()) as {
          battleOutcomeSeed: BattleOutcomeSeed;
          report?: { report: string };
        };

        if (!cancelled) {
          startTransition(() => {
            setBattleOutcomeSeed(data.battleOutcomeSeed);
            setBattleReport(data.report?.report ?? null);
          });
          setIsResolving(false);
        }
        return;
      }

      if (!snapshot?.messages?.length && !nextUserBattle.snapshotId) {
        if (!cancelled) {
          setResultError("실캔들 정산 시점이 됐지만 로컬 배틀 기록이 남아있지 않아. 같은 기기에서 다시 시도해줘.");
          setIsResolving(false);
        }
        return;
      }

      const outcomeResponse = await fetch("/api/battle/outcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userBattle: nextUserBattle,
          messages: snapshot?.messages,
        }),
      });

      const payload = (await outcomeResponse.json().catch(() => null)) as
        | {
            battleOutcomeSeed?: BattleOutcomeSeed;
            report?: { report: string };
            error?: string;
          }
        | null;

      if (!outcomeResponse.ok) {
        if (!cancelled) {
          setResultError(
            payload?.error === "settlement_pending"
              ? "아직 정산 캔들이 닫히지 않았어. 조금만 더 기다려줘."
              : "실캔들 정산 결과를 아직 만들지 못했어. 잠깐 뒤에 다시 열어줘.",
          );
          setIsResolving(false);
        }
        return;
      }

      if (!cancelled && payload?.battleOutcomeSeed) {
        startTransition(() => {
          setBattleOutcomeSeed(payload.battleOutcomeSeed ?? null);
          setBattleReport(payload.report?.report ?? null);
        });
        setIsResolving(false);
      }
    }

    void resolveBattleOutcome();

    return () => {
      cancelled = true;
    };
  }, [battleId, settlementPending, snapshot?.messages, userBattle]);

  useEffect(() => {
    if (!battleResult || !user?.userId || !battleId) {
      return;
    }

    const appliedBattleResults = readAppliedBattleResults();
    if (appliedBattleResults.has(battleId)) {
      return;
    }

    const nextLevel = updateLevels(userLevel, battleResult);
    setUserLevel(user.userId, nextLevel);
    markBattleResultApplied(battleId);
  }, [battleId, battleResult, setUserLevel, user?.userId, userLevel]);

  if (!userBattle || userBattle.coinId !== coinId) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader initialCurrentUserSnapshot={initialCurrentUserSnapshot} />
        <main className="mx-auto max-w-4xl px-4 py-6">
          <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_40px_rgba(17,29,61,0.08)]">
            <h1 className="font-display text-3xl font-bold tracking-[-0.05em]">
              결과를 계산할 라운드가 없어
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              차트 결과를 만들려면 먼저 팀과 차트 구간을 선택해야 해.
            </p>
            <Link
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-[18px] bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-[0_12px_24px_rgba(17,29,61,0.16)] transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary/30"
              href={`/battle/${coinId}/pick`}
            >
              라운드 다시 고르기
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const timeframeMeta = getBattleTimeframeMeta(userBattle.timeframe);

  if (settlementPending) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader initialCurrentUserSnapshot={initialCurrentUserSnapshot} />
        <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
          <section className="rounded-[28px] border border-border bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_18px_44px_rgba(17,29,61,0.08)]">
            <h1 className="font-display text-4xl font-bold tracking-[-0.05em]">실캔들 정산 대기 중</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {timeframeMeta.label} 라운드가 아직 끝나지 않았어. 정산 캔들이 닫히면 결과를 확정할게.
            </p>
          </section>
          <CountdownTimer
            seconds={getRemainingSeconds(userBattle.settlementAt)}
            label={`${timeframeMeta.label} 정산까지`}
            description={`${userBattle.marketSymbol} 실캔들 종가 기준으로 승패를 계산할 거야.`}
          />
          <RiskDisclaimer />
        </main>
      </div>
    );
  }

  if (!battleResult) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader initialCurrentUserSnapshot={initialCurrentUserSnapshot} />
        <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
          <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_40px_rgba(17,29,61,0.08)]">
            <h1 className="font-display text-3xl font-bold tracking-[-0.05em]">정산 결과 불러오는 중</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {isResolving ? "Bybit 실캔들을 조회해서 결과를 계산하고 있어." : "결과 기록을 확인하고 있어."}
            </p>
          </section>
          {resultError ? (
            <p className="rounded-[20px] border border-bear/20 bg-bear/10 px-4 py-3 text-sm text-bear">
              {resultError}
            </p>
          ) : null}
          <RiskDisclaimer />
        </main>
      </div>
    );
  }

  const previewLevel = updateLevels(userLevel, battleResult);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader initialCurrentUserSnapshot={initialCurrentUserSnapshot} />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        {isUserLoading ? (
          <p className="rounded-[20px] border border-border bg-[hsl(var(--surface-2))] px-4 py-3 text-sm text-muted-foreground">
            사용자 레벨을 불러오는 중이야.
          </p>
        ) : null}
        <VerdictBanner battleResult={battleResult} />
        <section className="rounded-[24px] border border-border bg-[hsl(var(--surface-2))] p-5">
          <p className="text-xs font-semibold text-muted-foreground">이번 라운드</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-[-0.05em]">
            {timeframeMeta.label} 실캔들 브리핑
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {userBattle.marketSymbol} {userBattle.priceSource} 기준으로 정산된 실제 캔들 종가를 사용했어.
          </p>
        </section>
        {resultError ? (
          <p className="rounded-[20px] border border-bear/20 bg-bear/10 px-4 py-3 text-sm text-bear">
            {resultError}
          </p>
        ) : null}
        <UserLevelChange battleResult={battleResult} userLevel={previewLevel} />
        <CharacterLevelChange winningTeam={battleResult.winningTeam} />
        <WinnerHighlight messages={snapshot?.messages ?? []} winningTeam={battleResult.winningTeam} />
        {battleReport ? (
          <section className="rounded-[24px] border border-border bg-card p-5">
            <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">차트 해설 리포트</h2>
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
