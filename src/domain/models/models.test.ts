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
      thumb: "thumb.png",
    });

    expect(parsed.symbol).toBe("BTC");
  });

  it("MarketDataSchema가 확장된 서술형 근거 필드를 검증한다", () => {
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
      newsHeadlines: ["Bitcoin breakout gains momentum", "ETF approval keeps market optimistic"],
      newsEventSummary: 'Alpha Vantage 대표 헤드라인은 "Bitcoin breakout gains momentum"이고, 전체 톤은 긍정 재료가 더 강하게 읽혀.',
      communitySentimentSummary: "공포탐욕은 61(Greed), 뉴스 감성은 +0.42라서 기대 심리가 앞서 있어.",
      longShortRatio: 1.08,
      openInterest: 125000000,
      fundingRate: 0.0123,
      whaleScore: 68,
      whaleFlowSummary: "Bybit 롱숏비율은 1.08이고 Hyperliquid 미결제약정은 $125.0M 수준이야.",
      marketStructureSummary: "CoinGecko 기준 거래대금은 $32.0B이고 미결제약정은 $125.0M 수준이라 구조가 가볍지 않아.",
      volume24h: 32000000000,
    });

    expect(parsed.newsHeadlines).toHaveLength(2);
    expect(parsed.whaleFlowSummary).toContain("Bybit");
    expect(parsed.marketStructureSummary).toContain("CoinGecko");
  });

  it("seed와 report 스키마가 여전히 핵심 필드를 검증한다", () => {
    expect(
      BattleOutcomeSeedSchema.parse({
        id: "outcome:battle-1",
        battleId: "battle-1",
        coinId: "bitcoin",
        coinSymbol: "BTC",
        timeframe: "5m",
        settlementAt: "2026-03-20T00:05:00.000Z",
        priceSource: "bybit-linear",
        marketSymbol: "BTCUSDT",
        settledPrice: 84210,
        winningTeam: "bull",
        priceChangePercent: 0.42,
        userSelectedTeam: "bull",
        userWon: true,
        strongestWinningArgument: "상승 모멘텀이 먼저 붙었다",
        weakestLosingArgument: "하락 전환 근거가 약했다",
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
        summary: "기술 구조가 아직 위에 열려 있어.",
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
        timeframe: "5m",
        selectedPrice: 84000,
        snapshotId: "snapshot-1",
        settlementAt: "2026-03-20T00:05:00.000Z",
        priceSource: "bybit-linear",
        marketSymbol: "BTCUSDT",
        settledPrice: 84210,
        userWon: true,
        createdAt: new Date().toISOString(),
      }),
    ).toBeTruthy();

    expect(
      BattleReportSchema.parse({
        id: "report:battle-1",
        battleId: "battle-1",
        outcomeSeedId: "outcome:battle-1",
        report: "BTC 5분봉 차트 보고",
        reportSource: "fallback",
        createdAt: new Date().toISOString(),
      }),
    ).toBeTruthy();
  });
});
