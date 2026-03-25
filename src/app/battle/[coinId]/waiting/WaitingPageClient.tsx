"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CountdownTimer } from "@/presentation/components/CountdownTimer";
import { MyPickSummary } from "@/presentation/components/MyPickSummary";
import { useBattleSnapshot } from "@/presentation/hooks/useBattleSnapshot";
import { useUserBattle } from "@/presentation/hooks/useUserBattle";
import { getBattleTimeframeMeta } from "@/shared/constants/battleTimeframes";

interface WaitingPageClientProps {
  coinId: string;
}

function getRemainingSeconds(settlementAt: string) {
  return Math.max(0, Math.ceil((Date.parse(settlementAt) - Date.now()) / 1000));
}

export function WaitingPageClient({
  coinId,
}: WaitingPageClientProps) {
  const router = useRouter();
  const { userBattle } = useUserBattle(coinId);
  const snapshot = useBattleSnapshot(coinId);
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    userBattle ? getRemainingSeconds(userBattle.settlementAt) : 0,
  );
  const hasPrefetchedResultRef = useRef(false);
  const hasNavigatedToResultRef = useRef(false);

  const resultHref = `/battle/${coinId}/result`;

  useEffect(() => {
    router.prefetch(resultHref);
  }, [resultHref, router]);

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

  useEffect(() => {
    if (!userBattle || remainingSeconds > 10 || hasPrefetchedResultRef.current) {
      return;
    }

    hasPrefetchedResultRef.current = true;

    void fetch("/api/battle/outcome", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        userBattle,
        messages: snapshot?.messages,
        mode: "settlement",
      }),
    }).catch(() => {
      hasPrefetchedResultRef.current = false;
    });
  }, [remainingSeconds, snapshot?.messages, userBattle]);

  useEffect(() => {
    if (remainingSeconds > 0 || hasNavigatedToResultRef.current) {
      return;
    }

    hasNavigatedToResultRef.current = true;
    router.push(resultHref);
  }, [remainingSeconds, resultHref, router]);

  if (!userBattle || userBattle.coinId !== coinId) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="mx-auto max-w-4xl px-4 py-6">
          <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_40px_rgba(17,29,61,0.08)]">
            <h1 className="font-display text-3xl font-bold tracking-[-0.05em]">
              선택한 라운드가 없어
            </h1>
            <p className="ag-body-copy mt-3 text-muted-foreground">
              먼저 어떤 팀과 어떤 차트 구간으로 볼지 정해야 다음 단계로 갈 수 있어.
            </p>
            <Link
              className="ag-primary-cta ag-primary-cta-text mt-5 rounded-[18px] px-4 transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary/30"
              href={`/battle/${coinId}/pick`}
            >
              라운드 선택하러 가기
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const timeframeMeta = getBattleTimeframeMeta(userBattle.timeframe);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <section className="rounded-[28px] border border-border bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_18px_44px_rgba(17,29,61,0.08)]">
          <h1 className="font-display text-4xl font-bold tracking-[-0.05em]">
            실캔들 정산 대기 중
          </h1>
          <p className="ag-body-copy mt-3 text-muted-foreground">
            {timeframeMeta.label} 라운드가 끝나면 Bybit 실캔들 기준으로 바로 승패를 계산할게.
          </p>
        </section>
        <CountdownTimer
          description={`${userBattle.marketSymbol} 실캔들 종가가 확정되면 결과 화면으로 자동 이동해.`}
          label={`${timeframeMeta.label} 정산까지`}
          seconds={remainingSeconds}
        />
        <MyPickSummary userBattle={userBattle} />
        <div className="space-y-3">
          <Link
            className="ag-primary-cta ag-primary-cta-text rounded-[18px] px-4 transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary/30"
            href={resultHref}
          >
            결과 화면 열기
          </Link>
          <p className="ag-body-copy text-muted-foreground">
            정산 10초 전부터 결과 화면과 outcome 계산을 미리 준비해.
          </p>
        </div>
      </main>
    </div>
  );
}
