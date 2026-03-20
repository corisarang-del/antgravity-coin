"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { characters, getCharacterById } from "@/shared/constants/characters";
import type { CurrentUserSnapshot } from "@/presentation/hooks/currentUserStore";
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
  initialCurrentUserSnapshot: CurrentUserSnapshot;
}

const teaserCopyByCharacterId: Record<string, string> = {
  aira: "곧 Aira가 차트와 추세선을 먼저 훑어볼 거야.",
  judy: "곧 Judy가 뉴스 재료를 빠르게 검토할 거야.",
  clover: "곧 Clover가 시장 분위기와 심리를 읽을 거야.",
  blaze: "곧 Blaze가 속도 붙는 구간인지 볼 거야.",
  ledger: "곧 Ledger가 거래 구조와 체력을 점검할 거야.",
  shade: "곧 Shade가 리스크 경고 신호를 확인할 거야.",
  vela: "곧 Vela가 고래 자금 흐름을 추적할 거야.",
  flip: "곧 Flip이 과열 구간의 반전 포인트를 찾을 거야.",
};

export function BattlePageClient({ coinId, initialCurrentUserSnapshot }: BattlePageClientProps) {
  const router = useRouter();
  const {
    messages,
    marketData,
    summary,
    activeCharacterId,
    isPickReady,
    isComplete,
    error,
    timingMetrics,
  } = useBattleStream({
    coinId,
  });

  const lastMessage = messages[messages.length - 1] ?? null;
  const indicators = summary?.indicators ?? [];
  const activeCharacter = activeCharacterId ? getCharacterById(activeCharacterId) : null;
  const firstMessageSeconds = timingMetrics?.firstMessageDisplayedAt
    ? Math.max(
        0,
        Math.round((timingMetrics.firstMessageDisplayedAt - timingMetrics.requestStartedAt) / 100) /
          10,
      )
    : null;
  const showPreMessageState = !error && messages.length === 0;
  const showWaitingPrimer = !error && !isPickReady;
  const messagedCharacterIds = new Set(messages.map((message) => message.characterId));
  const upcomingCharacters = characters
    .filter(
      (character) =>
        !messagedCharacterIds.has(character.id) && character.id !== activeCharacterId,
    )
    .slice(0, 3);
  const miniBriefingItems = [
    {
      label: "RSI",
      value: marketData ? marketData.rsi.toFixed(1) : "수집 중",
    },
    {
      label: "공포탐욕",
      value: marketData?.fearGreedIndex != null ? `${marketData.fearGreedIndex}` : "수집 중",
    },
    {
      label: "롱숏 비율",
      value: marketData?.longShortRatio != null ? marketData.longShortRatio.toFixed(2) : "수집 중",
    },
    {
      label: "펀딩비",
      value:
        marketData?.fundingRate != null ? `${marketData.fundingRate.toFixed(4)}%` : "수집 중",
    },
  ];

  const preMessageHeadline = activeCharacter
    ? `${activeCharacter.name}가 첫 발언을 정리 중이야.`
    : summary
      ? "시장 데이터는 준비됐고, 첫 캐릭터 순서를 맞추는 중이야."
      : "시장, 뉴스, 파생 지표를 모으는 중이야.";

  const preMessageSteps = [
    {
      label: "시장 데이터 수집",
      status: summary ? "done" : "active",
    },
    {
      label: "첫 캐릭터 준비",
      status: activeCharacter ? "done" : summary ? "active" : "pending",
    },
    {
      label: "첫 발언 수신",
      status: messages.length > 0 ? "done" : activeCharacter ? "active" : "pending",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader initialCurrentUserSnapshot={initialCurrentUserSnapshot} />
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
          {showPreMessageState ? (
            <div className="mt-4 rounded-[20px] border border-border/80 bg-[hsl(var(--surface-2))] px-4 py-4">
              <p className="text-sm font-semibold text-foreground">{preMessageHeadline}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                첫 발언은 보통 10~20초 안에 도착해. 지표가 많거나 외부 응답이 느리면 조금 더 걸릴 수 있어.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {preMessageSteps.map((step) => (
                  <div
                    key={step.label}
                    className={`rounded-[16px] border px-3 py-3 text-xs ${
                      step.status === "done"
                        ? "border-primary/20 bg-card text-foreground"
                        : step.status === "active"
                          ? "border-primary/25 bg-primary/5 text-foreground"
                          : "border-border/80 bg-background text-muted-foreground"
                    }`}
                  >
                    <p className="font-semibold">{step.label}</p>
                    <p className="mt-1">
                      {step.status === "done"
                        ? "완료"
                        : step.status === "active"
                          ? "진행 중"
                          : "대기 중"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
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
                  이미 받은 발언은 유지하고 있어. 다시 시도해서 이어가 볼 수 있어.
                </p>
              ) : null}
            </div>
          ) : null}
          {firstMessageSeconds != null ? (
            <p className="mt-3 text-xs text-muted-foreground">첫 발언 도착 시간: {firstMessageSeconds}초</p>
          ) : null}
        </section>

        {showWaitingPrimer ? (
          <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[24px] border border-border/80 bg-card p-5 shadow-[0_16px_32px_rgba(17,29,61,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                시장 미니 브리핑
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {miniBriefingItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[18px] border border-border/80 bg-[hsl(var(--surface-2))] px-4 py-4"
                  >
                    <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-xl font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-border/80 bg-card p-5 shadow-[0_16px_32px_rgba(17,29,61,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                곧 등장할 캐릭터
              </p>
              <div className="mt-4 grid gap-3">
                {upcomingCharacters.map((character) => (
                  <div
                    key={character.id}
                    className="rounded-[18px] border border-border/80 bg-[hsl(var(--surface-2))] px-4 py-4"
                  >
                    <p className="text-sm font-semibold text-foreground">{character.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{character.role}</p>
                    <p className="mt-3 text-sm text-foreground">
                      {teaserCopyByCharacterId[character.id] ?? `${character.name}가 다음 논거를 준비 중이야.`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

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

        {isPickReady ? (
          <div className="rounded-[24px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_16px_32px_rgba(17,29,61,0.06)]">
            <p className="text-sm text-muted-foreground">
              {isComplete ? "8명 발언이 모두 끝났어." : "양 팀 핵심 논거가 먼저 모였어."}
            </p>
            <Link
              className="mt-4 inline-flex min-h-12 items-center rounded-[18px] bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-[0_12px_24px_rgba(17,29,61,0.14)]"
              href={`/battle/${coinId}/pick`}
            >
              {isComplete ? "이제 내 선택하러 가기" : "핵심 논거 먼저 보고 팀 선택하러 가기"}
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  );
}
