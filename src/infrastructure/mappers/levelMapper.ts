import type { UserLevel } from "@/domain/models/UserLevel";

const titles = ["개미", "새싹개미", "중급개미", "고수개미", "전설개미"] as const;

export function mapXpToUserLevel(xp: number, wins: number, losses: number): UserLevel {
  const normalizedXp = Math.max(0, xp);
  const level = Math.min(5, Math.floor(normalizedXp / 100) + 1);

  return {
    level,
    title: titles[level - 1],
    xp: normalizedXp,
    wins,
    losses,
  };
}
