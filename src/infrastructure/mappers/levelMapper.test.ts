import { describe, expect, it } from "vitest";
import { getUserLevelTitle, mapXpToUserLevel, normalizeUserLevel } from "./levelMapper";

describe("levelMapper", () => {
  it("xp에 맞는 정상 등급명을 만든다", () => {
    expect(mapXpToUserLevel(0, 0, 0).title).toBe("개미");
    expect(mapXpToUserLevel(100, 0, 0).title).toBe("새싹개미");
    expect(mapXpToUserLevel(400, 0, 0).title).toBe("전설개미");
  });

  it("저장된 title이 깨졌거나 달라도 level 기준 canonical title로 교정한다", () => {
    expect(
      normalizeUserLevel({
        level: 1,
        title: "媛쒕?",
        xp: 12,
        wins: 1,
        losses: 0,
      }),
    ).toEqual({
      level: 1,
      title: "개미",
      xp: 12,
      wins: 1,
      losses: 0,
    });
    expect(
      normalizeUserLevel({
        level: 2,
        title: "아무말",
        xp: 120,
        wins: 3,
        losses: 1,
      }),
    ).toEqual({
      level: 2,
      title: "새싹개미",
      xp: 120,
      wins: 3,
      losses: 1,
    });
  });

  it("빈 값이나 비정상 level도 안전하게 보정한다", () => {
    expect(normalizeUserLevel(null)).toEqual({
      level: 1,
      title: "개미",
      xp: 0,
      wins: 0,
      losses: 0,
    });
    expect(getUserLevelTitle(99)).toBe("전설개미");
  });
});
