import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateBattleDebate,
  generateCharacterMessage,
} from "@/application/useCases/generateBattleDebate";
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
    newsHeadlines: ["Bitcoin breakout gains momentum", "ETF approval keeps market optimistic"],
    newsEventSummary: 'Alpha Vantage 대표 헤드라인은 "Bitcoin breakout gains momentum"이고, 전체 톤은 긍정 재료가 더 강하게 읽혀.',
    communitySentimentSummary: "공포탐욕은 61(Greed), 뉴스 감성은 +0.34라서 기대 심리가 앞서 있어.",
    longShortRatio: 1.08,
    openInterest: 128_000_000,
    fundingRate: 0.0123,
    whaleScore: 64,
    whaleFlowSummary: "Bybit 롱숏비율은 1.08이고, Hyperliquid 미결제약정은 $128.0M 수준이야.",
    marketStructureSummary: "CoinGecko 기준 거래대금은 $31.0B이고, 미결제약정은 $128.0M 수준이라 구조가 가볍지 않아.",
    volume24h: 31_000_000_000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateCharacterDebateChunk).mockResolvedValue(null);
  });

  it('각 발언은 stance: "bullish" | "bearish" 를 포함한다', async () => {
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

  it("fallback 메시지에 캐릭터별 말버릇 차이가 드러난다", async () => {
    const messages = await generateBattleDebate(marketData);

    const aira = messages.find((message) => message.characterId === "aira");
    const judy = messages.find((message) => message.characterId === "judy");
    const shade = messages.find((message) => message.characterId === "shade");
    const vela = messages.find((message) => message.characterId === "vela");
    const flip = messages.find((message) => message.characterId === "flip");

    expect(aira?.summary).toContain("내 눈엔");
    expect(judy?.summary).toContain("헤드라인만 보면");
    expect(shade?.summary).toContain("내 기준엔");
    expect(vela?.summary).toContain("밑에서 보면");
    expect(flip?.summary).toContain("근데 난");
  });

  it("fenced json 응답을 파싱해서 실제 메시지로 만든다", async () => {
    vi.mocked(generateCharacterDebateChunk).mockResolvedValueOnce({
      content:
        '```json\n{"summary":"첫 응답 성공","detail":"역할에 맞는 근거로 정리했다.","indicatorLabel":"RSI","indicatorValue":"62","stance":"bullish"}\n```',
      provider: "openrouter",
      model: "stepfun/step-3.5-flash:free",
      fallbackUsed: false,
    });

    const messages = await generateBattleDebate(marketData);

    expect(messages[0]?.summary).toBe("첫 응답 성공");
    expect(messages[0]?.provider).toBe("openrouter");
    expect(messages[0]?.model).toBe("stepfun/step-3.5-flash:free");
  });

  it("label 형식 응답도 파싱해서 fallback 없이 살린다", async () => {
    const aira = getCharacterById("aira");

    if (!aira) {
      throw new Error("missing_aira");
    }

    vi.mocked(generateCharacterDebateChunk).mockResolvedValueOnce({
      content: [
        "summary: 내 눈엔 차트 구조가 아직 위쪽으로 열려 있어.",
        "detail: 차트상 RSI랑 MACD 흐름을 같이 보면 기술적 방어가 아직 먼저 보여.",
        "indicatorLabel: RSI",
        "indicatorValue: 61.2",
        "stance: bullish",
      ].join("\n"),
      provider: "openrouter",
      model: "arcee-ai/trinity-mini",
      fallbackUsed: false,
    });

    const message = await generateCharacterMessage(marketData, aira, []);

    expect(message.fallbackUsed).toBe(false);
    expect(message.summary).toContain("내 눈엔");
    expect(message.model).toBe("arcee-ai/trinity-mini");
  });

  it("영문 금융 용어가 조금 섞여도 한국어로 정규화해서 살린다", async () => {
    const ledger = getCharacterById("ledger");

    if (!ledger) {
      throw new Error("missing_ledger");
    }

    vi.mocked(generateCharacterDebateChunk).mockResolvedValueOnce({
      content:
        '{"summary":"숫자상 on-chain liquidity는 아직 완전히 무너지지 않았어","detail":"구조적으로 보면 open interest와 funding rate가 같이 흔들려도 바로 붕괴로 볼 단계는 아니야","indicatorLabel":"open interest","indicatorValue":"128M","stance":"bearish"}',
      provider: "openrouter",
      model: "google/gemma-3-12b-it",
      fallbackUsed: false,
    });

    const message = await generateCharacterMessage(marketData, ledger, []);

    expect(message.fallbackUsed).toBe(false);
    expect(message.summary).toContain("온체인");
    expect(message.summary).not.toContain("on-chain");
    expect(message.detail).not.toContain("open interest");
    expect(message.detail).not.toContain("funding rate");
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

  it("이전 발언은 직전 1개, 반대팀 핵심 1개, 공통 요약 1개로 압축한다", async () => {
    vi.mocked(generateCharacterDebateChunk).mockResolvedValueOnce({
      content:
        '{"summary":"압축 확인","detail":"핵심만 보고 답했어.","indicatorLabel":"RSI","indicatorValue":"61","stance":"bullish"}',
      provider: "openrouter",
      model: "stepfun/step-3.5-flash:free",
      fallbackUsed: false,
    });

    const blaze = getCharacterById("blaze");
    if (!blaze) {
      throw new Error("missing_blaze");
    }

    await generateCharacterMessage(marketData, blaze, [
      {
        id: "m1",
        characterId: "aira",
        characterName: "Aira",
        team: "bull",
        stance: "bullish",
        summary: "Aira 요약",
        detail: "Aira detail",
        indicatorLabel: "RSI",
        indicatorValue: "61.2",
        provider: "test",
        model: "fixture",
        fallbackUsed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "m2",
        characterId: "ledger",
        characterName: "Ledger",
        team: "bear",
        stance: "bearish",
        summary: "Ledger 요약",
        detail: "Ledger detail",
        indicatorLabel: "온체인",
        indicatorValue: "약세",
        provider: "test",
        model: "fixture",
        fallbackUsed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "m3",
        characterId: "judy",
        characterName: "Judy",
        team: "bull",
        stance: "bullish",
        summary: "Judy 요약",
        detail: "Judy detail",
        indicatorLabel: "뉴스",
        indicatorValue: "긍정",
        provider: "test",
        model: "fixture",
        fallbackUsed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "m4",
        characterId: "shade",
        characterName: "Shade",
        team: "bear",
        stance: "bearish",
        summary: "Shade 요약",
        detail: "Shade detail",
        indicatorLabel: "리스크",
        indicatorValue: "경고",
        provider: "test",
        model: "fixture",
        fallbackUsed: false,
        createdAt: new Date().toISOString(),
      },
    ]);

    const input = vi.mocked(generateCharacterDebateChunk).mock.calls[0]?.[0]?.llmInput;

    expect(input?.previousMessages).toHaveLength(3);
    expect(input?.previousMessages.at(0)?.summary).toBe("Shade 요약");
    expect(input?.previousMessages.some((message) => message.characterName === "공통 요약")).toBe(
      true,
    );
  });

  it("Blaze 영문 응답은 한글 fallback으로 바꾼다", async () => {
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
    expect(message.summary).toMatch(/[가-힣]/);
    expect(message.detail).toMatch(/[가-힣]/);
  });

  it("Clover 영문 응답은 한글 fallback으로 바꾼다", async () => {
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
    expect(message.summary).toMatch(/[가-힣]/);
    expect(message.detail).toMatch(/[가-힣]/);
  });

  it("한글 문장 안에 중국어 조각이 섞이면 fallback으로 바꾼다", async () => {
    const clover = getCharacterById("clover");

    if (!clover) {
      throw new Error("missing_clover");
    }

    vi.mocked(generateCharacterDebateChunk).mockResolvedValueOnce({
      content:
        '{"summary":"공포가 완화되며 回流 가능성이 보인다","detail":"심리는 회복 중이지만 结束的 반등으로 볼 가능성도 있다","indicatorLabel":"FGI","indicatorValue":"71","stance":"bullish"}',
      provider: "openrouter",
      model: "mixed-script-model",
      fallbackUsed: false,
    });

    const message = await generateCharacterMessage(marketData, clover, []);

    expect(message.fallbackUsed).toBe(true);
    expect(message.summary).not.toContain("回流");
    expect(message.detail).not.toContain("结束的");
  });

  it("한글 문장 안에 소문자 영문 단어가 섞이면 fallback으로 바꾼다", async () => {
    const judy = getCharacterById("judy");

    if (!judy) {
      throw new Error("missing_judy");
    }

    vi.mocked(generateCharacterDebateChunk).mockResolvedValueOnce({
      content:
        '{"summary":"뉴스 감성이 회복되며 short covering 가능성이 있다","detail":"ETF 일정도 중요하지만 solchen 반응은 과열일 수 있다","indicatorLabel":"뉴스","indicatorValue":"0.07","stance":"bullish"}',
      provider: "openrouter",
      model: "mixed-latin-model",
      fallbackUsed: false,
    });

    const message = await generateCharacterMessage(marketData, judy, []);

    expect(message.fallbackUsed).toBe(true);
    expect(message.summary).not.toContain("short");
    expect(message.detail).not.toContain("solchen");
  });

  it("필수 근거 데이터가 비면 불가 메시지로 대체하고 배틀은 계속 진행한다", async () => {
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
    expect(message.summary).toContain("근거가 부족해");
    expect(message.detail).toContain("다음 턴에서는");
    expect(message.model).toBe("live-evidence-unavailable");
  });
});
