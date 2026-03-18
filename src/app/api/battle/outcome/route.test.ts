import { describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/battle/outcome/route";

vi.mock("@/infrastructure/api/geminiSynthesisClient", () => ({
  synthesizeBattleReportWithGemini: vi.fn().mockResolvedValue(null),
  synthesizeBattleLessonsWithGemini: vi.fn().mockResolvedValue(null),
}));

describe("POST /api/battle/outcome", () => {
  it("배틀 결과를 outcome/memory/report 구조로 저장 가능한 payload로 변환한다", async () => {
    const response = await POST(
      new Request("http://localhost/api/battle/outcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userBattle: {
            battleId: "battle-1",
            coinId: "bitcoin",
            coinSymbol: "BTC",
            selectedTeam: "bull",
            timeframe: "24h",
            selectedPrice: 84000,
            selectedAt: new Date().toISOString(),
          },
          marketData: {
            coinId: "bitcoin",
            symbol: "BTC",
            currentPrice: 85000,
            priceChange24h: 2.4,
            priceChange7d: 5.1,
            rsi: 61,
            macd: 2.3,
            bollingerUpper: 86200,
            bollingerLower: 80100,
            fearGreedIndex: 60,
            fearGreedLabel: "Greed",
            sentimentScore: 0.4,
            longShortRatio: 1.1,
            openInterest: 125000000,
            fundingRate: 0.0123,
            whaleScore: 66,
            volume24h: 32000000000,
          },
          messages: [
            {
              id: "1",
              characterId: "aira",
              characterName: "Aira",
              team: "bull",
              stance: "bullish",
              summary: "기술 구조가 버텨.",
              detail: "detail",
              indicatorLabel: "RSI",
              indicatorValue: "61",
              provider: "openrouter",
              model: "qwen/qwen3.5-9b",
              fallbackUsed: false,
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      }),
    );

    const data = (await response.json()) as {
      ok: boolean;
      battleOutcomeSeed: { battleId: string; ruleVersion: string };
      characterMemorySeeds: Array<{ characterId: string }>;
      playerDecisionSeed: { selectedTeam: string };
      report: { report: string };
      reportSource: "gemini" | "fallback";
    };

    expect(data.ok).toBe(true);
    expect(data.battleOutcomeSeed.battleId).toBe("battle-1");
    expect(data.battleOutcomeSeed.ruleVersion).toBe("v1");
    expect(data.characterMemorySeeds[0]?.characterId).toBe("aira");
    expect(data.playerDecisionSeed.selectedTeam).toBe("bull");
    expect(data.report.report).toContain("배틀");
    expect(data.reportSource).toBe("fallback");
  });

  it("battleId 기준으로 저장된 outcome 조회가 가능하다", async () => {
    const response = await GET(
      new Request("http://localhost/api/battle/outcome?battleId=battle-1"),
    );

    const data = (await response.json()) as {
      ok: boolean;
      battleOutcomeSeed: { battleId: string };
      report: { report: string };
      reportSource: "gemini" | "fallback";
    };

    expect(data.ok).toBe(true);
    expect(data.battleOutcomeSeed.battleId).toBe("battle-1");
    expect(data.report.report).toContain("배틀");
    expect(data.reportSource).toBe("fallback");
  });
});
