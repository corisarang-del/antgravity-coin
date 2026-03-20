"use client";

import Link from "next/link";
import type { CurrentUserSnapshot } from "@/presentation/hooks/currentUserStore";
import { AppHeader } from "@/presentation/components/AppHeader";
import { CountdownTimer } from "@/presentation/components/CountdownTimer";
import { MyPickSummary } from "@/presentation/components/MyPickSummary";
import { useUserBattle } from "@/presentation/hooks/useUserBattle";
import { getBattleTimeframeMeta } from "@/shared/constants/battleTimeframes";

interface WaitingPageClientProps {
  coinId: string;
  initialCurrentUserSnapshot: CurrentUserSnapshot;
}

function getRemainingSeconds(settlementAt: string) {
  return Math.max(0, Math.ceil((Date.parse(settlementAt) - Date.now()) / 1000));
}

export function WaitingPageClient({
  coinId,
  initialCurrentUserSnapshot,
}: WaitingPageClientProps) {
  const { userBattle } = useUserBattle(coinId);

  if (!userBattle || userBattle.coinId !== coinId) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader initialCurrentUserSnapshot={initialCurrentUserSnapshot} />
        <main className="mx-auto max-w-4xl px-4 py-6">
          <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_40px_rgba(17,29,61,0.08)]">
            <h1 className="font-display text-3xl font-bold tracking-[-0.05em]">선택한 라운드가 없어</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              먼저 어떤 팀과 어떤 차트 구간으로 볼지 정해야 다음 단계로 갈 수 있어.
            </p>
            <Link
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-[18px] bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-[0_12px_24px_rgba(17,29,61,0.16)] transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary/30"
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
      <AppHeader initialCurrentUserSnapshot={initialCurrentUserSnapshot} />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <section className="rounded-[28px] border border-border bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_18px_44px_rgba(17,29,61,0.08)]">
          <h1 className="font-display text-4xl font-bold tracking-[-0.05em]">실캔들 정산 대기 중</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {timeframeMeta.label} 라운드가 끝나면 Bybit 실캔들 기준으로 바로 승패를 계산할게.
          </p>
        </section>
        <CountdownTimer
          seconds={getRemainingSeconds(userBattle.settlementAt)}
          label={`${timeframeMeta.label} 정산까지`}
          description={`${userBattle.marketSymbol} 실캔들 종가가 확정되면 결과를 열 수 있어.`}
        />
        <MyPickSummary userBattle={userBattle} />
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-[18px] bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-[0_12px_24px_rgba(17,29,61,0.16)] transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary/30"
          href={`/battle/${coinId}/result`}
        >
          결과 화면 열기
        </Link>
      </main>
    </div>
  );
}
