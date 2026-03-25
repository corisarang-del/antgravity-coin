import { getTopCoinsSnapshot } from "@/application/useCases/getTopCoinsSnapshot";
import { getInitialCurrentUserSnapshot } from "@/infrastructure/auth/getInitialCurrentUserSnapshot";
import { AppHeader } from "@/presentation/components/AppHeader";
import { RecentCoinsList } from "@/presentation/components/RecentCoinsList";
import { RiskDisclaimer } from "@/presentation/components/RiskDisclaimer";
import { SearchBar } from "@/presentation/components/SearchBar";
import { TopCoinsGrid } from "@/presentation/components/TopCoinsGrid";
import { characters } from "@/shared/constants/characters";

export default async function HomePage() {
  const [topCoins, initialCurrentUserSnapshot] = await Promise.all([
    getTopCoinsSnapshot(),
    getInitialCurrentUserSnapshot(),
  ]);
  const bullCount = characters.filter((character) => character.team === "bull").length;
  const bearCount = characters.length - bullCount;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader currentPath="/home" initialCurrentUserSnapshot={initialCurrentUserSnapshot} />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        <section className="grid gap-4 rounded-[28px] border border-border bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_22px_50px_rgba(17,29,61,0.08)] md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col justify-between gap-5">
            <div className="space-y-4">
              <span className="inline-flex w-fit rounded-full border border-border/80 bg-[hsl(var(--surface-2))] px-3 py-2 text-xs font-semibold text-muted-foreground">
                원하는 팀으로 골라봐
              </span>
              <h1 className="max-w-full font-display whitespace-nowrap text-[clamp(1.55rem,4.3vw,3.75rem)] leading-none tracking-[-0.07em]">
                불리시팀 vs 베어리시팀
              </h1>
              <p className="ag-body-copy ag-body-copy-strong max-w-xl">
                AI 캐릭터 8명이 같은 코인을 서로 다른 관점으로 해석한다. 어느 팀이 더 맞는지
                고르고, 24시간 또는 7일 뒤 실제 결과로 실력을 확인한다.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] border border-bull/15 bg-[hsl(var(--surface-2))] p-4">
                <p className="text-xs font-semibold text-muted-foreground">불리시 팀</p>
                <p className="mt-2 font-display text-3xl font-bold tracking-[-0.05em] text-bull">
                  {bullCount}
                </p>
              </div>
              <div className="rounded-[22px] border border-bear/15 bg-[hsl(var(--surface-2))] p-4">
                <p className="text-xs font-semibold text-muted-foreground">베어리시 팀</p>
                <p className="mt-2 font-display text-3xl font-bold tracking-[-0.05em] text-bear">
                  {bearCount}
                </p>
              </div>
              <div className="rounded-[22px] border border-[hsl(var(--xp)/0.25)] bg-[hsl(var(--secondary))] p-4">
                <p className="text-xs font-semibold text-muted-foreground">보상 루프</p>
                <p className="mt-2 font-display text-3xl font-bold tracking-[-0.05em] text-xp">
                  XP
                </p>
              </div>
            </div>
          </div>

          <SearchBar initialCoins={topCoins} />
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-5">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">지금 배틀하기</h2>
                <p className="ag-body-copy ag-body-copy-strong">문서 기준 MVP용 추천 코인 목록</p>
              </div>
            </div>
            <TopCoinsGrid coins={topCoins} />
          </div>
          <div className="space-y-5">
            <RecentCoinsList />
            <RiskDisclaimer />
          </div>
        </section>
      </main>
    </div>
  );
}
