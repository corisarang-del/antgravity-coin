import type { BattleResult } from "@/domain/models/BattleResult";
import type { UserLevel } from "@/domain/models/UserLevel";

interface UserLevelChangeProps {
  battleResult: BattleResult;
  userLevel: UserLevel;
}

export function UserLevelChange({ battleResult, userLevel }: UserLevelChangeProps) {
  return (
    <section className="rounded-[24px] border border-border bg-card p-5">
      <p className="text-xs font-semibold text-muted-foreground">내 성장</p>
      <p className="mt-2 font-display text-3xl font-bold tracking-[-0.05em]">
        {battleResult.userWon ? "레벨업" : battleResult.winningTeam === "draw" ? "변화 없음" : "레벨 유지"}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        현재 {userLevel.title} · XP {userLevel.xp}
      </p>
    </section>
  );
}
