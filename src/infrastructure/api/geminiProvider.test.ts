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
        recentBattleLessons: [],
        characterLessons: [],
        previousMessages: [],
      },
      "gemini-2.5-flash-lite",
    );

    expect(result).toContain('"summary"');
    vi.unstubAllGlobals();
  });
  it("system prompt와 user prompt를 분리해서 보낸다", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
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
    });
    vi.stubGlobal("fetch", fetchMock);

    const { geminiProvider } = await import("@/infrastructure/api/geminiProvider");

    await geminiProvider.generateDebateChunk(
      {
        characterId: "judy",
        characterName: "Judy",
        role: "?댁뒪 ?ㅼ뭅?고꽣",
        team: "bull",
        specialty: "?댁뒪",
        personality: "?щ즺瑜?癒쇱? 蹂대뒗 ??낆씠??",
        selectionReason: "?댁뒪??罹먮┃???뚯뒪?몄슜?댁빞.",
        coinSymbol: "BTC",
        focusSummary: "summary",
        evidence: [],
        recentBattleLessons: [],
        characterLessons: [],
        previousMessages: [],
      },
      "gemini-2.5-flash-lite",
    );

    const requestInit = fetchMock.mock.calls[0]?.[1];
    const body = JSON.parse((requestInit?.body as string) ?? "{}") as {
      systemInstruction?: { parts?: Array<{ text?: string }> };
      contents?: Array<{ role?: string; parts?: Array<{ text?: string }> }>;
    };

    expect(body.systemInstruction?.parts?.[0]?.text).toContain("Judy");
    expect(body.contents?.[0]?.role).toBe("user");
    expect(body.contents?.[0]?.parts?.[0]?.text).toContain("summary");
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
    );
    expect(requestInit?.headers).toMatchObject({
      "Content-Type": "application/json",
      "x-goog-api-key": "key",
    });
    vi.unstubAllGlobals();
  });
});
