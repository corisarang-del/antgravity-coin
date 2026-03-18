import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateBattleDebate, generateCharacterMessage } from "@/application/useCases/generateBattleDebate";
import { generateCharacterDebateChunk } from "@/infrastructure/api/llmRouter";
import type { MarketData } from "@/domain/models/MarketData";
import { getCharacterById } from "@/shared/constants/characters";

vi.mock("@/infrastructure/api/llmRouter", () => ({
  generateCharacterDebateChunk: vi.fn().mockResolvedValue(null),
}));

describe("generateBattleDebate", () => {
  const marketData: MarketData = {
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
    longShortRatio: 1.08,
    openInterest: 128_000_000,
    fundingRate: 0.0123,
    whaleScore: 64,
    volume24h: 31_000_000_000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateCharacterDebateChunk).mockResolvedValue(null);
  });

  it('각 발언이 stance: "bullish" | "bearish" 를 포함한다', async () => {
    const messages = await generateBattleDebate(marketData);

    expect(messages).toHaveLength(8);
    expect(messages.every((message) => ["bullish", "bearish"].includes(message.stance))).toBe(true);
  });

  it("fallback 메시지도 캐릭터별 표현 차이를 유지한다", async () => {
    const messages = await generateBattleDebate(marketData);

    const aira = messages.find((message) => message.characterId === "aira");
    const shade = messages.find((message) => message.characterId === "shade");

    expect(aira?.summary).not.toBe(shade?.summary);
    expect(aira?.detail).not.toBe(shade?.detail);
  });

  it("fenced json 응답도 파싱해서 실제 메시지로 쓴다", async () => {
    vi.mocked(generateCharacterDebateChunk).mockResolvedValueOnce({
      content:
        '```json\n{"summary":"첫 응답 성공","detail":"역할에 맞는 근거로 정리한다.","indicatorLabel":"RSI","indicatorValue":"62","stance":"bullish"}\n```',
      provider: "openrouter",
      model: "stepfun/step-3.5-flash:free",
      fallbackUsed: false,
    });

    const messages = await generateBattleDebate(marketData);

    expect(messages[0]?.summary).toBe("첫 응답 성공");
    expect(messages[0]?.provider).toBe("openrouter");
    expect(messages[0]?.model).toBe("stepfun/step-3.5-flash:free");
  });

  it("llm 호출이 예외를 던져도 8명 발언을 모두 유지한다", async () => {
    vi.mocked(generateCharacterDebateChunk)
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue(null);

    const messages = await generateBattleDebate(marketData);

    expect(messages).toHaveLength(8);
    expect(messages[0]?.characterId).toBe("aira");
    expect(messages[0]?.fallbackUsed).toBe(true);
  });

  it("Blaze 영어 응답은 한글 fallback으로 바꾼다", async () => {
    const blaze = getCharacterById("blaze");

    if (!blaze) {
      throw new Error("missing_blaze");
    }

    vi.mocked(generateCharacterDebateChunk).mockResolvedValueOnce({
      content:
        '{"summary":"Momentum is still strong","detail":"Volume supports a higher move","indicatorLabel":"RSI","indicatorValue":"62","stance":"bullish"}',
      provider: "openrouter",
      model: "openrouter/hunter-alpha",
      fallbackUsed: false,
    });

    const message = await generateCharacterMessage(marketData, blaze, []);

    expect(message.fallbackUsed).toBe(true);
    expect(message.summary).toContain("Blaze");
    expect(message.summary).toMatch(/[가-힣]/);
    expect(message.detail).toMatch(/[가-힣]/);
  });

  it("Clover 영어 응답은 한글 fallback으로 바꾼다", async () => {
    const clover = getCharacterById("clover");

    if (!clover) {
      throw new Error("missing_clover");
    }

    vi.mocked(generateCharacterDebateChunk).mockResolvedValueOnce({
      content:
        '{"summary":"Sentiment remains hot","detail":"Community mood is still risk-on","indicatorLabel":"FGI","indicatorValue":"71","stance":"bullish"}',
      provider: "openrouter",
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      fallbackUsed: false,
    });

    const message = await generateCharacterMessage(marketData, clover, []);

    expect(message.fallbackUsed).toBe(true);
    expect(message.summary).toContain("Clover");
    expect(message.summary).toMatch(/[가-힣]/);
    expect(message.detail).toMatch(/[가-힣]/);
  });

  it("필수 근거 실데이터가 비면 사과 메시지로 대체하고 배틀은 계속 진행한다", async () => {
    const vela = getCharacterById("vela");

    if (!vela) {
      throw new Error("missing_vela");
    }

    const partialMarketData: MarketData = {
      ...marketData,
      openInterest: null,
      whaleScore: null,
    };

    const message = await generateCharacterMessage(partialMarketData, vela, []);

    expect(message.fallbackUsed).toBe(true);
    expect(message.summary).toContain("근거가 부족해서");
    expect(message.detail).toContain("다음 턴에서는");
    expect(message.model).toBe("live-evidence-unavailable");
  });
});
