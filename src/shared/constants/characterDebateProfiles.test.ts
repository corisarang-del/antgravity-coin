import { describe, expect, it } from "vitest";
import { getCharacterDebateProfile, listCharacterDebateProfiles } from "@/shared/constants/characterDebateProfiles";

describe("characterDebateProfiles", () => {
  it("keeps all eight characters in the editable debate config", () => {
    const profiles = listCharacterDebateProfiles();

    expect(profiles).toHaveLength(8);
    expect(profiles.every((profile) => profile.evidenceSources.length > 0)).toBe(true);
    expect(profiles.every((profile) => profile.prompt.systemRules.length > 0)).toBe(true);
  });

  it("still exposes model routing and prompt metadata for blaze and vela", () => {
    const aira = getCharacterDebateProfile("aira");
    const blaze = getCharacterDebateProfile("blaze");
    const vela = getCharacterDebateProfile("vela");
    const shade = getCharacterDebateProfile("shade");
    const flip = getCharacterDebateProfile("flip");

    expect(aira?.modelRoute.model).toBe("stepfun/step-3.5-flash:free");
    expect(blaze?.modelRoute.model).toBe("openrouter/hunter-alpha");
    expect(vela?.modelRoute.model).toBe("minimax/minimax-m2.5:free");
    expect(flip?.modelRoute.model).toBe("stepfun/step-3.5-flash:free");
    expect(flip?.modelRoute.fallbackModel).toBe("qwen/qwen3.5-9b");
    expect(blaze?.display.summaryTargets).toContain("배틀 피드 카드");
    expect(vela?.evidenceSources.some((source) => source.source.includes("Hyperliquid"))).toBe(true);
    expect(shade?.evidenceSources.some((source) => source.source.includes("Bybit"))).toBe(true);
  });
});
