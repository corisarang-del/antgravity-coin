"use client";

import Link from "next/link";
import { startTransition, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
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

interface OutcomeResponsePayload {
  ok: boolean;
  battleOutcomeSeed: BattleOutcomeSeed;
  report?: {
    report: string;
    reportSource?: "gemini" | "fallback";
  } | null;
  reportSource?: "gemini" | "fallback" | null;
  reportPending?: boolean;
}

type ResolveStage = "idle" | "checking" | "settling" | "report";

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

function getRemainingSeconds(settlementAt: string) {
  return Math.max(0, Math.ceil((Date.parse(settlementAt) - Date.now()) / 1000));
}

function getStageCopy(resolveStage: ResolveStage) {
  switch (resolveStage) {
    case "checking":
      return {
        title: "기존 정산 결과 확인 중",
        description: "이미 계산된 결과가 있으면 바로 보여주고 있어.",
      };
    case "settling":
      return {
        title: "실캔들 조회 중",
        description: "Bybit 실캔들을 조회해서 승패와 변화율을 먼저 계산하고 있어.",
      };
    case "report":
      return {
        title: "리포트 정리 중",
        description: "승패와 XP는 먼저 보여주고, 차트 해설 리포트는 뒤에서 붙이고 있어.",
      };
    default:
      return {
        title: "정산 결과 준비 중",
        description: "결과를 열기 전에 필요한 데이터를 확인하고 있어.",
      };
  }
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
  const [reportError, setReportError] = useState<string | null>(null);
  const [resolveStage, setResolveStage] = useState<ResolveStage>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    userBattle ? getRemainingSeconds(userBattle.settlementAt) : 0,
  );
  const deferredReportBattleIdRef = useRef<string | null>(null);

  const battleId = userBattle?.battleId ?? null;
  const settlementPending = userBattle ? remainingSeconds > 0 : false;
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
    if (!userBattle) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds(getRemainingSeconds(userBattle.settlementAt));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [userBattle]);

  function applyOutcomePayload(payload: OutcomeResponsePayload) {
    startTransition(() => {
      setBattleOutcomeSeed(payload.battleOutcomeSeed);
      setBattleReport(payload.report?.report ?? null);
    });
  }

  const hydrateDeferredReport = useEffectEvent(async () => {
    if (!userBattle || !battleId || deferredReportBattleIdRef.current === battleId) {
      return;
    }

    deferredReportBattleIdRef.current = battleId;
    setResolveStage("report");
    setReportError(null);

    try {
      const response = await fetch("/api/battle/outcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userBattle,
          messages: snapshot?.messages,
          mode: "full",
        }),
      });

      const payload = (await response.json().catch(() => null)) as OutcomeResponsePayload | null;

      if (!response.ok || !payload?.battleOutcomeSeed) {
        setReportError("리포트를 아직 정리하지 못했어. 승패와 XP는 정상 반영됐어.");
        return;
      }

      applyOutcomePayload(payload);
    } catch {
      setReportError("리포트를 아직 정리하지 못했어. 승패와 XP는 정상 반영됐어.");
    }
  });

  useEffect(() => {
    if (!userBattle || !battleId || settlementPending) {
      return;
    }

    let cancelled = false;
    const nextBattleId = battleId;
    const nextUserBattle = userBattle;

    async function resolveBattleOutcome() {
      setResultError(null);
      setResolveStage("checking");

      const battleIdQuery = encodeURIComponent(nextBattleId);
      const existingOutcomeResponse = await fetch(`/api/battle/outcome?battleId=${battleIdQuery}`, {
        credentials: "include",
      });

      if (cancelled) {
        return;
      }

      if (existingOutcomeResponse.ok) {
        const data = (await existingOutcomeResponse.json()) as OutcomeResponsePayload;
        applyOutcomePayload(data);

        if (!data.report) {
          void hydrateDeferredReport();
        }
        return;
      }

      if (!snapshot?.messages?.length && !nextUserBattle.snapshotId) {
        setResultError("정산 시점인데 로컬 배틀 기록이 남아있지 않아. 같은 기기에서 다시 시도해줘.");
        return;
      }

      setResolveStage("settling");
      const outcomeResponse = await fetch("/api/battle/outcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userBattle: nextUserBattle,
          messages: snapshot?.messages,
          mode: "settlement",
        }),
      });

      const payload = (await outcomeResponse.json().catch(() => null)) as
        | (OutcomeResponsePayload & { error?: string })
        | null;

      if (cancelled) {
        return;
      }

      if (!outcomeResponse.ok || !payload?.battleOutcomeSeed) {
        setResultError(
          payload?.error === "settlement_pending"
            ? "아직 정산 캔들이 닫히지 않았어. 잠깐만 더 기다려줘."
            : "정산 결과를 아직 만들지 못했어. 잠시 후 다시 이어서 보여줄게.",
        );
        return;
      }

      applyOutcomePayload(payload);

      if (!payload.report) {
        void hydrateDeferredReport();
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
              차트 결과를 만들려면 먼저 팀과 차트 구간을 골라야 해.
            </p>
            <Link
              className="ag-primary-cta ag-primary-cta-text mt-5 rounded-[18px] px-4 transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary/30"
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
              {timeframeMeta.label} 라운드가 아직 끝나지 않았어. 0초가 되면 바로 정산 계산을 시작해.
            </p>
          </section>
          <CountdownTimer
            description={`${userBattle.marketSymbol} 실캔들 종가가 닫히면 자동으로 정산 계산 단계로 넘어가.`}
            label={`${timeframeMeta.label} 정산까지`}
            seconds={remainingSeconds}
          />
          <RiskDisclaimer />
        </main>
      </div>
    );
  }

  if (!battleResult) {
    const stageCopy = getStageCopy(resolveStage);

    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader initialCurrentUserSnapshot={initialCurrentUserSnapshot} />
        <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
          <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_40px_rgba(17,29,61,0.08)]">
            <h1 className="font-display text-3xl font-bold tracking-[-0.05em]">{stageCopy.title}</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{stageCopy.description}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                {
                  label: "기존 결과 확인",
                  done: resolveStage !== "idle",
                },
                {
                  label: "실캔들 조회와 승패 계산",
                  done: resolveStage === "settling" || resolveStage === "report",
                },
                {
                  label: "리포트 정리",
                  done: resolveStage === "report",
                },
              ].map((step) => (
                <div
                  key={step.label}
                  className={`rounded-[16px] border px-3 py-3 text-xs ${
                    step.done
                      ? "border-primary/25 bg-primary/5 text-foreground"
                      : "border-border/80 bg-[hsl(var(--surface-2))] text-muted-foreground"
                  }`}
                >
                  <p className="font-semibold">{step.label}</p>
                </div>
              ))}
            </div>
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
        ) : (
          <section className="rounded-[24px] border border-border bg-card p-5">
            <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">리포트 정리 중</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              승패와 XP는 먼저 보여주고 있어. 차트 해설 리포트는 뒤에서 정리해서 붙이는 중이야.
            </p>
            {reportError ? (
              <p className="mt-3 rounded-[18px] border border-border bg-[hsl(var(--surface-2))] px-4 py-3 text-sm text-muted-foreground">
                {reportError}
              </p>
            ) : (
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {["실캔들 정산 완료", "승패와 XP 반영 완료", "리포트 후행 생성 중"].map((item, index) => (
                  <div
                    key={item}
                    className={`rounded-[16px] border px-3 py-3 text-xs ${
                      index < 2
                        ? "border-primary/25 bg-primary/5 text-foreground"
                        : "border-border/80 bg-[hsl(var(--surface-2))] text-muted-foreground"
                    }`}
                  >
                    <p className="font-semibold">{item}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        <RiskDisclaimer />
      </main>
    </div>
  );
}
