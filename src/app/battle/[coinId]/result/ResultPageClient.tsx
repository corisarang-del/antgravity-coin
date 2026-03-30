"use client";

import Link from "next/link";
import { startTransition, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { updateLevels } from "@/application/useCases/updateLevels";
import type { BattleOutcomeSeed } from "@/domain/models/BattleOutcomeSeed";
import type { BattleResult } from "@/domain/models/BattleResult";
import { CharacterLevelChange } from "@/presentation/components/CharacterLevelChange";
import { CountdownTimer } from "@/presentation/components/CountdownTimer";
import { MyPickSummary } from "@/presentation/components/MyPickSummary";
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
type ProgressStep = {
  label: string;
  status: string;
  progressPercent: number;
  active?: boolean;
};

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

function getTimeProgress(selectedAt: string, settlementAt: string, now = Date.now()) {
  const selectedAtMs = Date.parse(selectedAt);
  const settlementAtMs = Date.parse(settlementAt);

  if (!Number.isFinite(selectedAtMs) || !Number.isFinite(settlementAtMs) || settlementAtMs <= selectedAtMs) {
    return {
      totalDurationMs: 0,
      elapsedMs: 0,
      remainingMs: 0,
      progressRatio: 0,
      progressPercent: 0,
    };
  }

  const totalDurationMs = settlementAtMs - selectedAtMs;
  const elapsedMs = Math.min(Math.max(0, now - selectedAtMs), totalDurationMs);
  const remainingMs = Math.max(0, settlementAtMs - now);
  const progressRatio = Math.min(1, Math.max(0, elapsedMs / totalDurationMs));
  const progressPercent = Math.round(progressRatio * 100);

  return {
    totalDurationMs,
    elapsedMs,
    remainingMs,
    progressRatio,
    progressPercent,
  };
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

function ResultProgressBar({
  label,
  progressPercent,
  helperText,
}: {
  label: string;
  progressPercent: number;
  helperText: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground">{progressPercent}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[hsl(var(--surface-2))]">
        <div
          aria-label={label}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progressPercent}
          className="h-full rounded-full bg-primary transition-all duration-500"
          role="progressbar"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{helperText}</p>
    </div>
  );
}

function ResultProgressStepCard({ step }: { step: ProgressStep }) {
  return (
    <div
      className={`rounded-[16px] border px-3 py-3 text-xs transition-colors ${
        step.active
          ? "border-primary/25 bg-primary/5"
          : "border-border/80 bg-[hsl(var(--surface-2))]"
      }`}
    >
      <p className="font-semibold text-foreground">{step.label}</p>
      <p className="mt-1 text-muted-foreground">{step.status}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/70">
        <div
          aria-label={`${step.label} 진행도`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={step.progressPercent}
          className="h-full rounded-full bg-primary transition-all duration-500"
          role="progressbar"
          style={{ width: `${step.progressPercent}%` }}
        />
      </div>
    </div>
  );
}

export function ResultPageClient({ coinId }: ResultPageClientProps) {
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
  const timeProgress = userBattle
    ? getTimeProgress(userBattle.selectedAt, userBattle.settlementAt)
    : getTimeProgress("", "");
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
        <main className="mx-auto max-w-4xl px-4 py-6">
          <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_40px_rgba(17,29,61,0.08)]">
            <h1 className="font-display text-3xl font-bold tracking-[-0.05em]">
              결과를 계산할 라운드가 없어
            </h1>
            <p className="ag-body-copy mt-3 text-muted-foreground">
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
  const pendingSteps: ProgressStep[] = [
    {
      label: "차트 마감 대기",
      status: `실시간 정산까지 ${remainingSeconds}s`,
      progressPercent: timeProgress.progressPercent,
      active: true,
    },
    {
      label: "승패와 XP 계산",
      status: "곧 시작",
      progressPercent: 0,
    },
    {
      label: "리포트와 요약 정리",
      status: "곧 시작",
      progressPercent: 0,
    },
  ];
  const resolveStageSteps: ProgressStep[] = [
    {
      label: "기존 결과 확인",
      status: resolveStage === "idle" ? "곧 확인" : "확인 중",
      progressPercent: resolveStage === "idle" ? 0 : 100,
      active: resolveStage === "checking",
    },
    {
      label: "실캔들 조회와 승패 계산",
      status:
        resolveStage === "settling"
          ? "계산 중"
          : resolveStage === "report"
            ? "계산 완료"
            : "곧 시작",
      progressPercent:
        resolveStage === "settling" ? 70 : resolveStage === "report" ? 100 : 0,
      active: resolveStage === "settling",
    },
    {
      label: "리포트 정리",
      status: resolveStage === "report" ? "정리 중" : "곧 시작",
      progressPercent: resolveStage === "report" ? 70 : 0,
      active: resolveStage === "report",
    },
  ];

  if (settlementPending) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
          <section className="rounded-[28px] border border-border bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_18px_44px_rgba(17,29,61,0.08)]">
            <h1 className="font-display text-4xl font-bold tracking-[-0.05em]">실캔들 정산 대기 중</h1>
            <p className="ag-body-copy mt-3 text-muted-foreground">
              {timeframeMeta.label} 라운드가 아직 끝나지 않았어. 0초가 되면 바로 정산 계산을 시작해.
            </p>
          </section>
          <CountdownTimer
            description={`${userBattle.marketSymbol} 실캔들 종가가 닫히면 자동으로 정산 계산 단계로 넘어가.`}
            label={`${timeframeMeta.label} 정산까지`}
            seconds={remainingSeconds}
          />
          <MyPickSummary userBattle={userBattle} />
          <section className="rounded-[24px] border border-border bg-card p-5">
            <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">결과 페이지 준비 중</h2>
            <p className="ag-body-copy mt-3 text-muted-foreground">
              방금 누른 버튼은 결과를 즉시 확정하는 버튼이 아니라 결과 페이지로 먼저 들어오는 버튼이야.
              정산 시각 전에는 카운트다운과 준비 상태를 먼저 보여주고, 시간이 되면 같은 화면에서 결과 카드가
              채워져.
            </p>
            <div className="mt-4">
              <ResultProgressBar
                helperText={`약 ${remainingSeconds}초 남음`}
                label="준비 진행도"
                progressPercent={timeProgress.progressPercent}
              />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {pendingSteps.map((step) => (
                <ResultProgressStepCard key={step.label} step={step} />
              ))}
            </div>
            <p className="ag-body-copy mt-4 text-muted-foreground">
              현재까지 저장된 발언: {(snapshot?.messages?.length ?? 0)}/8
            </p>
          </section>
          <RiskDisclaimer />
        </main>
      </div>
    );
  }

  if (!battleResult) {
    const stageCopy = getStageCopy(resolveStage);

    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
          <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_40px_rgba(17,29,61,0.08)]">
            <h1 className="font-display text-3xl font-bold tracking-[-0.05em]">{stageCopy.title}</h1>
            <p className="ag-body-copy mt-3 text-muted-foreground">{stageCopy.description}</p>
            <div className="mt-4">
              <ResultProgressBar
                helperText={
                  resolveStage === "checking"
                    ? "기존 결과를 먼저 확인하고 있어."
                    : resolveStage === "settling"
                      ? "실캔들을 읽고 승패와 XP를 계산 중이야."
                      : "결과는 먼저 보여주고 리포트를 뒤에서 붙이고 있어."
                }
                label="정산 진행도"
                progressPercent={
                  resolveStage === "checking"
                    ? 33
                    : resolveStage === "settling"
                      ? 67
                      : resolveStage === "report"
                        ? 90
                        : 0
                }
              />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {resolveStageSteps.map((step) => (
                <ResultProgressStepCard key={step.label} step={step} />
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
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        {isUserLoading ? (
          <p className="ag-body-copy rounded-[20px] border border-border bg-[hsl(var(--surface-2))] px-4 py-3 text-muted-foreground">
            사용자 레벨을 불러오는 중이야.
          </p>
        ) : null}
        <VerdictBanner battleResult={battleResult} />
        <section className="rounded-[24px] border border-border bg-[hsl(var(--surface-2))] p-5">
          <p className="text-xs font-semibold text-muted-foreground">이번 라운드</p>
          <p className="mt-2 font-display text-3xl font-bold tracking-[-0.05em]">
            {timeframeMeta.label} 실캔들 브리핑
          </p>
          <p className="ag-body-copy mt-2 text-muted-foreground">
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
            <pre className="ag-body-copy mt-4 whitespace-pre-wrap text-muted-foreground">
              {battleReport}
            </pre>
          </section>
        ) : (
          <section className="rounded-[24px] border border-border bg-card p-5">
            <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">리포트 정리 중</h2>
            <p className="ag-body-copy mt-3 text-muted-foreground">
              승패와 XP는 먼저 보여주고 있어. 차트 해설 리포트는 뒤에서 정리해서 붙이는 중이야.
            </p>
            {reportError ? (
              <p className="ag-body-copy mt-3 rounded-[18px] border border-border bg-[hsl(var(--surface-2))] px-4 py-3 text-muted-foreground">
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
