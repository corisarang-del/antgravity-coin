import type { UserLevel } from "@/domain/models/UserLevel";

export const userLevelTitles = ["개미", "새싹개미", "중급개미", "고수개미", "전설개미"] as const;

function clampUserLevel(level: number) {
  return Math.min(5, Math.max(1, Math.floor(level)));
}

export function getUserLevelTitle(level: number) {
  return userLevelTitles[clampUserLevel(level) - 1];
}

export function normalizeUserLevel(userLevel: Partial<UserLevel> | null | undefined): UserLevel {
  const level = clampUserLevel(userLevel?.level ?? 1);
  const title = getUserLevelTitle(level);

  return {
    level,
    title,
    xp: Math.max(0, userLevel?.xp ?? 0),
    wins: Math.max(0, userLevel?.wins ?? 0),
    losses: Math.max(0, userLevel?.losses ?? 0),
  };
}

export function mapXpToUserLevel(xp: number, wins: number, losses: number): UserLevel {
  const normalizedXp = Math.max(0, xp);
  const level = clampUserLevel(Math.floor(normalizedXp / 100) + 1);

  return {
    level,
    title: getUserLevelTitle(level),
    xp: normalizedXp,
    wins,
    losses,
  };
}
