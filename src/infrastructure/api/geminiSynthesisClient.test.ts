import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/constants/envConfig", () => ({
  envConfig: {
    geminiApiKey: "key",
    geminiApiUrl: "https://generativelanguage.googleapis.com/v1beta/models",
  },
}));

describe("geminiSynthesisClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("lesson 합성 요청을 system instruction과 user prompt로 분리해서 보낸다", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    reportSummary: "요약",
                    globalLessons: ["하나", "둘", "셋"],
                    characterLessons: [
                      { characterId: "aira", characterName: "Aira", lesson: "교훈", wasCorrect: true },
                    ],
                  }),
                },
              ],
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { synthesizeBattleLessonsWithGemini } = await import(
      "@/infrastructure/api/geminiSynthesisClient"
    );

    await synthesizeBattleLessonsWithGemini({
      battleOutcomeSeed: {
        id: "seed-1",
        battleId: "battle-1",
        coinId: "bitcoin",
        coinSymbol: "BTC",
        timeframe: "1h",
        winningTeam: "bull",
        priceChangePercent: 3.2,
        userSelectedTeam: "bull",
        userWon: true,
        strongestWinningArgument: "거래량이 받쳐줬어",
        weakestLosingArgument: "하락 논거가 약했어",
        settledPrice: 100,
        ruleVersion: "v1",
        createdAt: new Date().toISOString(),
        settlementAt: new Date().toISOString(),
        priceSource: "bybit-linear",
        marketSymbol: "BTCUSDT",
      },
      playerDecisionSeed: {
        id: "decision-1",
        battleId: "battle-1",
        coinId: "bitcoin",
        coinSymbol: "BTC",
        snapshotId: "snapshot-1",
        selectedTeam: "bull",
        timeframe: "1h",
        selectedPrice: 90,
        settlementAt: new Date().toISOString(),
        priceSource: "bybit-linear",
        marketSymbol: "BTCUSDT",
        settledPrice: 100,
        userWon: true,
        createdAt: new Date().toISOString(),
      },
      characterMemorySeeds: [
        {
          id: "memory-1",
          battleId: "battle-1",
          coinId: "bitcoin",
          characterId: "aira",
          characterName: "Aira",
          team: "bull",
          stance: "bullish",
          summary: "차트가 버텼어",
          indicatorLabel: "RSI",
          indicatorValue: "64",
          provider: "openrouter",
          model: "test-model",
          fallbackUsed: false,
          wasCorrect: true,
          createdAt: new Date().toISOString(),
        },
      ],
      report: "최종 리포트",
    });

    const requestInit = fetchMock.mock.calls[0]?.[1];
    const body = JSON.parse((requestInit?.body as string) ?? "{}") as {
      systemInstruction?: { parts?: Array<{ text?: string }> };
      contents?: Array<{ role?: string; parts?: Array<{ text?: string }> }>;
    };

    expect(body.systemInstruction?.parts?.[0]?.text).toContain("JSON 하나만 반환");
    expect(body.contents?.[0]?.role).toBe("user");
    expect(body.contents?.[0]?.parts?.[0]?.text).toContain("최종 리포트: 최종 리포트");
  });
});
