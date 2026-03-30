import { describe, expect, it, vi } from "vitest";

vi.mock("@/shared/constants/envConfig", () => ({
  envConfig: {
    geminiApiKey: "key",
    geminiApiUrl: "https://generativelanguage.googleapis.com/v1beta/models",
  },
}));

describe("geminiSynthesisClient", () => {
  it("Gemini synthesis 요청은 API 키를 헤더로 보내고 URL 쿼리에 남기지 않는다", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: "리포트 요약" }],
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { synthesizeBattleReportWithGemini } = await import(
      "@/infrastructure/api/geminiSynthesisClient"
    );

    await synthesizeBattleReportWithGemini({
      battleOutcomeSeed: {
        id: "outcome-1",
        battleId: "battle-1",
        coinId: "bitcoin",
        coinSymbol: "BTC",
        timeframe: "24h",
        settlementAt: new Date().toISOString(),
        priceSource: "bybit-linear",
        marketSymbol: "BTCUSDT",
        settledPrice: 105,
        winningTeam: "bull",
        priceChangePercent: 5,
        userSelectedTeam: "bull",
        userWon: true,
        strongestWinningArgument: "상승 모멘텀이 유지됐어.",
        weakestLosingArgument: "하락 근거가 약했어.",
        ruleVersion: "v1",
        createdAt: new Date().toISOString(),
      },
      characterMemorySeeds: [],
      playerDecisionSeed: {
        id: "decision-1",
        battleId: "battle-1",
        coinId: "bitcoin",
        coinSymbol: "BTC",
        timeframe: "24h",
        snapshotId: "snapshot-1",
        selectedTeam: "bull",
        selectedPrice: 100,
        settlementAt: new Date().toISOString(),
        priceSource: "bybit-linear",
        marketSymbol: "BTCUSDT",
        settledPrice: 105,
        userWon: true,
        createdAt: new Date().toISOString(),
      },
    });

    const requestInit = fetchMock.mock.calls[0]?.[1];
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent",
    );
    expect(requestInit?.headers).toMatchObject({
      "Content-Type": "application/json",
      "x-goog-api-key": "key",
    });
    vi.unstubAllGlobals();
  });
});
