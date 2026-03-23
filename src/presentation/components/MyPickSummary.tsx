import type { UserBattle } from "@/domain/models/UserBattle";
import { getBattleTimeframeMeta } from "@/shared/constants/battleTimeframes";

interface MyPickSummaryProps {
  userBattle: UserBattle;
}

export function MyPickSummary({ userBattle }: MyPickSummaryProps) {
  const timeframeMeta = getBattleTimeframeMeta(userBattle.timeframe);

  return (
    <div className="rounded-[24px] border border-border bg-card p-5">
      <p className="text-xs font-semibold text-muted-foreground">내 포지션</p>
      <p className="mt-2 font-display text-3xl font-bold tracking-[-0.05em]">{userBattle.coinSymbol}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {userBattle.selectedTeam === "bull" ? "불리시 팀" : "베어리시 팀"} · {timeframeMeta.label}
      </p>
    </div>
  );
}
