import type { UserLevel } from "@/domain/models/UserLevel";

export const userLevelTitles = ["개미", "새싹개미", "중급개미", "고수개미", "전설개미"] as const;

const userLevelTitleSet = new Set<string>(userLevelTitles);

function clampUserLevel(level: number) {
  return Math.min(5, Math.max(1, Math.floor(level)));
}

function looksCorruptedTitle(title: string) {
  if (!title) {
    return true;
  }

  // 기존 DB/localStorage에 남아 있는 mojibake 값을 감지해서 canonical title로 교정한다.
  return /[?�]/.test(title) || /[^\u0000-\u007F\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF\s]/.test(title);
}

export function getUserLevelTitle(level: number) {
  return userLevelTitles[clampUserLevel(level) - 1];
}

export function normalizeUserLevel(userLevel: Partial<UserLevel> | null | undefined): UserLevel {
  const level = clampUserLevel(userLevel?.level ?? 1);
  const rawTitle = typeof userLevel?.title === "string" ? userLevel.title.trim() : "";
  const title =
    !looksCorruptedTitle(rawTitle) && userLevelTitleSet.has(rawTitle)
      ? rawTitle
      : getUserLevelTitle(level);

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
