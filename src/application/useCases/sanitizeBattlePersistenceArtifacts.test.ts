import { describe, expect, it } from "vitest";
import {
  sanitizeBattleOutcomeSeed,
  sanitizeBattleReport,
  sanitizeCharacterMemorySeeds,
} from "@/application/useCases/sanitizeBattlePersistenceArtifacts";

describe("sanitizeBattlePersistenceArtifacts", () => {
  it("영속화 전에 깨진 문자열과 영문 응답을 안전한 한국어 fallback으로 치환한다", () => {
    const outcomeSeed = sanitizeBattleOutcomeSeed({
      id: "outcome:test",
      battleId: "battle-test",
      coinId: "bitcoin",
      coinSymbol: "BTC",
      timeframe: "24h",
      settlementAt: "2026-03-21T00:00:00.000Z",
      priceSource: "bybit-linear",
      marketSymbol: "BTCUSDT",
      settledPrice: 86000,
      winningTeam: "bull",
      priceChangePercent: 2.4,
      userSelectedTeam: "bull",
      userWon: true,
      strongestWinningArgument:
        "Despite recent gains, BTC shows signs of overheating with RSI above 60.",
      weakestLosingArgument: "湲곗닠 援ъ“媛 踰꾪떞??",
      ruleVersion: "v1",
      createdAt: new Date().toISOString(),
    });

    const memorySeeds = sanitizeCharacterMemorySeeds([
      {
        id: "memory:test:aira",
        battleId: "battle-test",
        coinId: "bitcoin",
        characterId: "aira",
        characterName: "Aira",
        team: "bull",
        stance: "bullish",
        indicatorLabel: "RSI",
        indicatorValue: "61",
        summary: "BTC?㏘릿遙섉씈?녶뭽歷끿츞?뗥뒟竊뚧퐳",
        provider: "openrouter",
        model: "qwen/qwen3.5-9b",
        fallbackUsed: false,
        wasCorrect: true,
        createdAt: new Date().toISOString(),
      },
    ]);

    const report = sanitizeBattleReport(
      {
        id: "report:test",
        battleId: "battle-test",
        outcomeSeedId: "outcome:test",
        report: "Despite recent gains, BTC remains exposed to a sharp pullback.",
        reportSource: "gemini",
        createdAt: new Date().toISOString(),
      },
      outcomeSeed,
      memorySeeds,
    );

    expect(outcomeSeed.strongestWinningArgument).toContain("불리시");
    expect(outcomeSeed.weakestLosingArgument).toContain("베어리시");
    expect(memorySeeds[0]?.summary).toContain("Aira");
    expect(report.report).toContain("BTC");
    expect(report.report).not.toContain("Despite recent gains");
  });
});
