import type { BattleResult } from "@/domain/models/BattleResult";
import { getBattleTimeframeMeta } from "@/shared/constants/battleTimeframes";

interface VerdictBannerProps {
  battleResult: BattleResult;
}

export function VerdictBanner({ battleResult }: VerdictBannerProps) {
  const timeframeMeta = getBattleTimeframeMeta(battleResult.timeframe);
  const title =
    battleResult.winningTeam === "draw"
      ? "무승부 마감"
      : battleResult.winningTeam === "bull"
        ? "불리시 캔들 우세"
        : "베어리시 캔들 우세";

  return (
    <section className="rounded-[28px] border border-border bg-card p-5">
      <p className="text-xs font-semibold text-muted-foreground">차트형 결과 브리핑</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.05em]">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {timeframeMeta.label} 기준 변화율은 {battleResult.priceChangePercent.toFixed(2)}%야.
      </p>
    </section>
  );
}
