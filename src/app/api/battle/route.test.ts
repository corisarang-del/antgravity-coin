import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/battle/route";
import { generateCharacterDebateChunk } from "@/infrastructure/api/llmRouter";
import { getBattleMarketSnapshot } from "@/application/useCases/getBattleMarketSnapshot";

vi.mock("@/infrastructure/api/llmRouter", () => ({
  generateCharacterDebateChunk: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/application/useCases/getBattleMarketSnapshot", () => ({
  getBattleMarketSnapshot: vi.fn(),
}));

describe("POST /api/battle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateCharacterDebateChunk).mockResolvedValue(null);
    vi.mocked(getBattleMarketSnapshot).mockResolvedValue({
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
        longShortRatio: 1.08,
        openInterest: 128_000_000,
        fundingRate: 0.0123,
        whaleScore: 64,
        volume24h: 31_000_000_000,
      },
      summary: {
        headline: "BTC 시장 요약",
        bias: "bull",
        indicators: [
          { label: "RSI", value: "61.2" },
        ],
      },
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

  it("중간 llm 예외가 있어도 8개 message 이벤트와 완료 이벤트를 유지한다", async () => {
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
