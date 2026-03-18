import type { UserBattle } from "@/domain/models/UserBattle";

interface MyPickSummaryProps {
  userBattle: UserBattle;
}

export function MyPickSummary({ userBattle }: MyPickSummaryProps) {
  return (
    <div className="rounded-[24px] border border-border bg-card p-5">
      <p className="text-xs font-semibold text-muted-foreground">내 선택</p>
      <p className="mt-2 font-display text-3xl font-bold tracking-[-0.05em]">{userBattle.coinSymbol}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {userBattle.selectedTeam === "bull" ? "불리시 팀" : "베어리시 팀"} · {userBattle.timeframe}
      </p>
    </div>
  );
}
