import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/battle/route";
import { generateCharacterDebateChunk } from "@/infrastructure/api/llmRouter";
import { getPreparedBattleContext } from "@/application/useCases/preparedBattleContext";

vi.mock("@/infrastructure/api/llmRouter", () => ({
  generateCharacterDebateChunk: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/application/useCases/preparedBattleContext", () => ({
  getPreparedBattleContext: vi.fn(),
}));

function createPreparedContext() {
  return {
    coinId: "bitcoin",
    marketData: {
      coinId: "bitcoin",
      symbol: "BTC",
      currentPrice: 84000,
      priceChange24h: 2.4,
      priceChange7d: 6.8,
      rsi: 61.2,
      macd: 123.45,
      bollingerUpper: 86000,
      bollingerLower: 81000,
      fearGreedIndex: 61,
      fearGreedLabel: "Greed",
      sentimentScore: 0.34,
      newsHeadlines: ["Bitcoin breakout gains momentum"],
      newsEventSummary: 'Alpha Vantage 대표 헤드라인은 "Bitcoin breakout gains momentum"이고, 전체 톤은 긍정 재료가 더 강하게 읽혀.',
      communitySentimentSummary: "공포탐욕은 61(Greed), 뉴스 감성은 +0.34라서 기대 심리가 앞서 있어.",
      longShortRatio: 1.08,
      openInterest: 128_000_000,
      fundingRate: 0.0123,
      whaleScore: 64,
      whaleFlowSummary: "Bybit 롱숏비율은 1.08이고, Hyperliquid 미결제약정은 $128.0M 수준이야.",
      marketStructureSummary: "CoinGecko 기준 거래대금은 $31.0B이고, 미결제약정은 $128.0M 수준이라 구조가 가볍지 않아.",
      volume24h: 31_000_000_000,
    },
    summary: {
      headline: "BTC 시장 요약",
      bias: "bull",
      indicators: [{ label: "RSI", value: "61.2" }],
    },
    reusableDebateContext: {
      recentBattleLessons: [],
      characterLessonsById: {},
    },
    preparedEvidence: {},
    firstTurnDrafts: {},
    preparedAt: new Date().toISOString(),
  };
}

describe("POST /api/battle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateCharacterDebateChunk).mockResolvedValue(null);
    vi.mocked(getPreparedBattleContext).mockResolvedValue({
      context: createPreparedContext(),
      preparedContextHit: false,
      preparedFirstTurnHit: false,
      preparedAtAgeMs: 0,
    });
  });

  it("character_start 이벤트를 포함한 SSE 응답을 반환한다", async () => {
    const response = await POST(
      new Request("http://localhost/api/battle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coinId: "bitcoin" }),
      }),
    );

    const text = await response.text();
    expect(text).toContain("event: character_start");
  });

  it("준비된 첫 발언 초안이 있으면 즉시 재사용한다", async () => {
    vi.mocked(getPreparedBattleContext).mockResolvedValueOnce({
      context: {
        ...createPreparedContext(),
        firstTurnDrafts: {
          aira: {
            id: "draft-1",
            characterId: "aira",
            characterName: "Aira",
            team: "bull",
            stance: "bullish",
            summary: "Aira: 준비된 첫 발언",
            detail: "준비된 초안 detail",
            indicatorLabel: "RSI",
            indicatorValue: "61.2",
            provider: "prep",
            model: "prep-draft",
            fallbackUsed: false,
            createdAt: new Date().toISOString(),
          },
          ledger: {
            id: "draft-2",
            characterId: "ledger",
            characterName: "Ledger",
            team: "bear",
            stance: "bearish",
            summary: "Ledger: 준비된 첫 반박",
            detail: "준비된 ledger detail",
            indicatorLabel: "롱숏 비율",
            indicatorValue: "1.08",
            provider: "prep",
            model: "prep-draft",
            fallbackUsed: false,
            createdAt: new Date().toISOString(),
          },
        },
      },
      preparedContextHit: true,
      preparedFirstTurnHit: true,
      preparedAtAgeMs: 100,
    });

    const response = await POST(
      new Request("http://localhost/api/battle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coinId: "bitcoin" }),
      }),
    );

    const text = await response.text();
    expect(text).toContain("Aira: 준비된 첫 발언");
    expect(text).toContain("Ledger: 준비된 첫 반박");
    expect(response.headers.get("x-battle-prepared-first-turn-hit")).toBe("true");
  });

  it("양 팀 핵심 논거가 2개씩 모이면 battle_pick_ready 이벤트를 먼저 보낸다", async () => {
    const response = await POST(
      new Request("http://localhost/api/battle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coinId: "bitcoin" }),
      }),
    );

    const text = await response.text();
    const pickReadyIndex = text.indexOf("event: battle_pick_ready");
    const battleCompleteIndex = text.indexOf("event: battle_complete");

    expect(pickReadyIndex).toBeGreaterThan(-1);
    expect(battleCompleteIndex).toBeGreaterThan(-1);
    expect(pickReadyIndex).toBeLessThan(battleCompleteIndex);
    expect(text).toContain('"bullCount":2');
    expect(text).toContain('"bearCount":2');
  });

  it("중간 llm 예외가 있어도 나머지 message 이벤트와 완료 이벤트를 유지한다", async () => {
    vi.mocked(generateCharacterDebateChunk)
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/battle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coinId: "bitcoin" }),
      }),
    );

    const text = await response.text();
    const messageEventCount = (text.match(/event: message/g) ?? []).length;

    expect(messageEventCount).toBe(8);
    expect(text).toContain("event: battle_complete");
    expect(text).toContain('"count":8');
  });

  it("coinId가 없으면 400을 반환한다", async () => {
    const response = await POST(
      new Request("http://localhost/api/battle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(400);
  });
});
