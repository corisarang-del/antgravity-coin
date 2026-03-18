import { describe, expect, it, vi } from "vitest";

vi.mock("@/shared/constants/envConfig", () => ({
  envConfig: {
    geminiApiKey: "key",
    geminiApiUrl: "https://generativelanguage.googleapis.com/v1beta/models",
  },
}));

describe("geminiProvider", () => {
  it("Gemini 응답에서 text를 추출한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: '{"summary":"ok"}' }],
              },
            },
          ],
        }),
      }),
    );

    const { geminiProvider } = await import("@/infrastructure/api/geminiProvider");

    const result = await geminiProvider.generateDebateChunk(
      {
        characterId: "judy",
        characterName: "Judy",
        role: "뉴스 스카우터",
        team: "bull",
        specialty: "뉴스",
        personality: "재료를 먼저 보는 타입이야.",
        selectionReason: "뉴스형 캐릭터 테스트용이야.",
        coinSymbol: "BTC",
        focusSummary: "summary",
        evidence: [],
        previousMessages: [],
      },
      "gemini-2.5-flash-lite",
    );

    expect(result).toContain('"summary"');
    vi.unstubAllGlobals();
  });
});
