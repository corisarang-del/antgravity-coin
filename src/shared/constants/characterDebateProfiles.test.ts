import { describe, expect, it } from "vitest";
import {
  getCharacterDebateProfile,
  listCharacterDebateProfiles,
} from "@/shared/constants/characterDebateProfiles";

describe("characterDebateProfiles", () => {
  it("keeps all eight characters in the editable debate config", () => {
    const profiles = listCharacterDebateProfiles();

    expect(profiles).toHaveLength(8);
    expect(profiles.every((profile) => profile.evidenceSources.length > 0)).toBe(true);
    expect(profiles.every((profile) => profile.prompt.systemRules.length > 0)).toBe(true);
  });

  it("gives non-chart characters their own narrative evidence fields", () => {
    const judy = getCharacterDebateProfile("judy");
    const clover = getCharacterDebateProfile("clover");
    const vela = getCharacterDebateProfile("vela");
    const ledger = getCharacterDebateProfile("ledger");

    expect(
      judy?.evidenceSources.some((source) => source.kind === "market" && source.field === "newsHeadlines"),
    ).toBe(true);
    expect(
      judy?.evidenceSources.some((source) => source.kind === "market" && source.field === "newsEventSummary"),
    ).toBe(true);
    expect(
      clover?.evidenceSources.some(
        (source) => source.kind === "market" && source.field === "communitySentimentSummary",
      ),
    ).toBe(true);
    expect(
      vela?.evidenceSources.some((source) => source.kind === "market" && source.field === "whaleFlowSummary"),
    ).toBe(true);
    expect(
      ledger?.evidenceSources.some(
        (source) => source.kind === "market" && source.field === "marketStructureSummary",
      ),
    ).toBe(true);
  });
});
