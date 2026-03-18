import { describe, expect, it } from "vitest";
import { BattleOutcomeSeedSchema } from "@/domain/models/BattleOutcomeSeed";
import { BattleReportSchema } from "@/domain/models/BattleReport";
import { CharacterMemorySeedSchema } from "@/domain/models/CharacterMemorySeed";
import { CoinSchema } from "@/domain/models/Coin";
import { MarketDataSchema } from "@/domain/models/MarketData";
import { PlayerDecisionSeedSchema } from "@/domain/models/PlayerDecisionSeed";

describe("domain schemas", () => {
  it("CoinSchema가 유효한 코인 데이터를 통과시킨다", () => {
    const parsed = CoinSchema.parse({
      id: "bitcoin",
      symbol: "BTC",
      name: "Bitcoin",
      currentPrice: 84120,
      priceChange24h: 2.4,
      marketCap: 1_600_000_000_000,
      thumb: "₿",
    });

    expect(parsed.symbol).toBe("BTC");
  });

  it("MarketDataSchema가 정상 범위를 검증한다", () => {
    const parsed = MarketDataSchema.parse({
      coinId: "bitcoin",
      symbol: "BTC",
      currentPrice: 84120,
      priceChange24h: 2.4,
      priceChange7d: 6.2,
      rsi: 58,
      macd: 2.4,
      bollingerUpper: 86200,
      bollingerLower: 80100,
      fearGreedIndex: 61,
      fearGreedLabel: "Greed",
      sentimentScore: 0.42,
      longShortRatio: 1.08,
      openInterest: 125000000,
      fundingRate: 0.0123,
      whaleScore: 68,
      volume24h: 32000000000,
    });

    expect(parsed.rsi).toBeGreaterThanOrEqual(0);
    expect(parsed.rsi).toBeLessThanOrEqual(100);
  });

  it("seed와 report 스키마가 확장 모델을 검증한다", () => {
    expect(
      BattleOutcomeSeedSchema.parse({
        id: "outcome:battle-1",
        battleId: "battle-1",
        coinId: "bitcoin",
        coinSymbol: "BTC",
        timeframe: "24h",
        winningTeam: "bull",
        priceChangePercent: 4.2,
        userSelectedTeam: "bull",
        userWon: true,
        strongestWinningArgument: "상승 논리가 더 강했다.",
        weakestLosingArgument: "하락 논리가 약했다.",
        ruleVersion: "v1",
        createdAt: new Date().toISOString(),
      }),
    ).toBeTruthy();

    expect(
      CharacterMemorySeedSchema.parse({
        id: "memory:battle-1:aira",
        battleId: "battle-1",
        coinId: "bitcoin",
        characterId: "aira",
        characterName: "Aira",
        team: "bull",
        stance: "bullish",
        indicatorLabel: "RSI",
        indicatorValue: "61.4",
        summary: "기술 구조가 버틴다.",
        provider: "openrouter",
        model: "qwen/qwen3.5-9b",
        fallbackUsed: false,
        wasCorrect: true,
        createdAt: new Date().toISOString(),
      }),
    ).toBeTruthy();

    expect(
      PlayerDecisionSeedSchema.parse({
        id: "decision:battle-1",
        battleId: "battle-1",
        coinId: "bitcoin",
        coinSymbol: "BTC",
        selectedTeam: "bull",
        timeframe: "24h",
        selectedPrice: 84000,
        userWon: true,
        createdAt: new Date().toISOString(),
      }),
    ).toBeTruthy();

    expect(
      BattleReportSchema.parse({
        id: "report:battle-1",
        battleId: "battle-1",
        outcomeSeedId: "outcome:battle-1",
        report: "BTC 24h 배틀 회고",
        reportSource: "fallback",
        createdAt: new Date().toISOString(),
      }),
    ).toBeTruthy();
  });
});
