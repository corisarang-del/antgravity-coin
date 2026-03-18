"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/presentation/components/AppHeader";
import { IndicatorCard } from "@/presentation/components/IndicatorCard";
import { RiskDisclaimer } from "@/presentation/components/RiskDisclaimer";
import { SpeakerSpotlight } from "@/presentation/components/SpeakerSpotlight";
import { TeamBoard } from "@/presentation/components/TeamBoard";
import { useBattleStream } from "@/presentation/hooks/useBattleStream";

const BattleFeed = dynamic(
  () => import("@/presentation/components/BattleFeed").then((module) => module.BattleFeed),
  {
    loading: () => (
      <section className="space-y-3 rounded-[24px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_16px_32px_rgba(17,29,61,0.06)]">
        <div className="h-6 w-28 rounded-full bg-[hsl(var(--surface-2))]" />
        <div className="grid gap-3">
          <div className="h-28 rounded-[20px] bg-[hsl(var(--surface-2))]" />
          <div className="h-28 rounded-[20px] bg-[hsl(var(--surface-2))]" />
        </div>
      </section>
    ),
  },
);

interface BattlePageClientProps {
  coinId: string;
}

export function BattlePageClient({ coinId }: BattlePageClientProps) {
  const router = useRouter();
  const { messages, marketData, summary, activeCharacterId, isComplete, error, timingMetrics } =
    useBattleStream({
      coinId,
    });

  const lastMessage = messages[messages.length - 1] ?? null;
  const indicators = summary?.indicators ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <section className="rounded-[28px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_18px_40px_rgba(17,29,61,0.08)]">
          <span className="inline-flex rounded-full bg-[hsl(var(--surface-2))] px-3 py-2 text-xs font-semibold text-muted-foreground">
            실시간 배틀 스트림
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.05em]">
            {marketData?.symbol ?? coinId.toUpperCase()} 배틀
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {summary?.headline ?? "시장 데이터를 수집하고 캐릭터 발언을 준비 중이야."}
          </p>
          {error ? (
            <div className="mt-4 rounded-[18px] border border-bear/20 bg-bear/10 px-4 py-4 text-sm text-bear">
              <p>{error}</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  className="inline-flex min-h-10 items-center rounded-[14px] bg-bear px-4 py-2 font-semibold text-white"
                  onClick={() => router.refresh()}
                  type="button"
                >
                  다시 시도
                </button>
                <Link
                  className="inline-flex min-h-10 items-center rounded-[14px] border border-bear/30 px-4 py-2 font-semibold text-bear"
                  href="/home"
                >
                  홈으로 이동
                </Link>
              </div>
              {messages.length > 0 ? (
                <p className="mt-3 text-xs text-bear/80">
                  이미 받은 발언은 유지하고 있어. 다시 시도해서 이어갈 수 있어.
                </p>
              ) : null}
            </div>
          ) : null}
          {timingMetrics?.firstMessageDisplayedAt ? (
            <p className="mt-3 text-xs text-muted-foreground">
              첫 발언 도달 시간:{" "}
              {Math.max(
                0,
                Math.round(
                  (timingMetrics.firstMessageDisplayedAt - timingMetrics.requestStartedAt) / 100,
                ) / 10,
              )}
              초
            </p>
          ) : null}
        </section>

        <TeamBoard activeCharacterId={activeCharacterId} messages={messages} />

        <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <BattleFeed messages={messages} />
          <div className="space-y-4">
            <SpeakerSpotlight message={lastMessage} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {indicators.map((indicator) => (
                <IndicatorCard
                  key={indicator.label}
                  label={indicator.label}
                  value={indicator.value}
                />
              ))}
            </div>
            <RiskDisclaimer />
          </div>
        </section>

        {isComplete ? (
          <div className="rounded-[24px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_16px_32px_rgba(17,29,61,0.06)]">
            <p className="text-sm text-muted-foreground">8명 발언이 모두 끝났어.</p>
            <Link
              className="mt-4 inline-flex min-h-12 items-center rounded-[18px] bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-[0_12px_24px_rgba(17,29,61,0.14)]"
              href={`/battle/${coinId}/pick`}
            >
              이제 팀 선택하러 가기
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  );
}
