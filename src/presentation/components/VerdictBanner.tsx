import type { BattleResult } from "@/domain/models/BattleResult";

interface VerdictBannerProps {
  battleResult: BattleResult;
}

export function VerdictBanner({ battleResult }: VerdictBannerProps) {
  const title =
    battleResult.winningTeam === "draw"
      ? "무승부"
      : battleResult.winningTeam === "bull"
        ? "불리시 팀 승리"
        : "베어리시 팀 승리";

  return (
    <section className="rounded-[28px] border border-border bg-card p-5">
      <p className="text-xs font-semibold text-muted-foreground">최종 판정</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.05em]">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        선택한 기간 기준 가격 변화는 {battleResult.priceChangePercent.toFixed(2)}%다.
      </p>
    </section>
  );
}
