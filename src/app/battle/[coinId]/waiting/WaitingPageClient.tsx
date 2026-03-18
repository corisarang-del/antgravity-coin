"use client";

import Link from "next/link";
import { AppHeader } from "@/presentation/components/AppHeader";
import { CountdownTimer } from "@/presentation/components/CountdownTimer";
import { MyPickSummary } from "@/presentation/components/MyPickSummary";
import { useUserBattle } from "@/presentation/hooks/useUserBattle";

interface WaitingPageClientProps {
  coinId: string;
}

export function WaitingPageClient({ coinId }: WaitingPageClientProps) {
  const { userBattle } = useUserBattle();

  if (!userBattle || userBattle.coinId !== coinId) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <main className="mx-auto max-w-4xl px-4 py-6">
          <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_40px_rgba(17,29,61,0.08)]">
            <h1 className="font-display text-3xl font-bold tracking-[-0.05em]">선택 정보가 없어</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              아직 저장된 선택이 없어. 먼저 팀을 골라줘.
            </p>
            <Link
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-[18px] bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-[0_12px_24px_rgba(17,29,61,0.16)] transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary/30"
              href={`/battle/${coinId}/pick`}
            >
              팀 선택하러 가기
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <section className="rounded-[28px] border border-border bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_18px_44px_rgba(17,29,61,0.08)]">
          <h1 className="font-display text-4xl font-bold tracking-[-0.05em]">결과 대기 중</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            선택은 저장됐어. 이제 결과를 확인할 수 있을 때까지 잠깐 기다려줘.
          </p>
        </section>
        <CountdownTimer seconds={userBattle.timeframe === "24h" ? 12 : 18} />
        <MyPickSummary userBattle={userBattle} />
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-[18px] bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-[0_12px_24px_rgba(17,29,61,0.16)] transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary/30"
          href={`/battle/${coinId}/result`}
        >
          결과 보러 가기
        </Link>
      </main>
    </div>
  );
}
