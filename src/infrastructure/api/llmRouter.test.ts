import { beforeEach, describe, expect, it, vi } from "vitest";

const generateDebateChunkMock = vi.fn();
const getCachedLlmResponseMock = vi.fn();
const setCachedLlmResponseMock = vi.fn();

vi.mock("@/infrastructure/api/openRouterProvider", () => ({
  openRouterProvider: {
    provider: "openrouter",
    generateDebateChunk: generateDebateChunkMock,
  },
}));

vi.mock("@/infrastructure/api/geminiProvider", () => ({
  geminiProvider: {
    provider: "gemini",
    generateDebateChunk: vi.fn(),
  },
}));

vi.mock("@/infrastructure/cache/llmResponseCache", () => ({
  buildLlmResponseCacheKey: vi.fn().mockReturnValue("cache-key"),
  getCachedLlmResponse: getCachedLlmResponseMock,
  setCachedLlmResponse: setCachedLlmResponseMock,
}));

describe("generateCharacterDebateChunk", () => {
  beforeEach(() => {
    generateDebateChunkMock.mockReset();
    getCachedLlmResponseMock.mockReset();
    setCachedLlmResponseMock.mockReset();
    getCachedLlmResponseMock.mockReturnValue(null);
  });

  it("같은 openrouter provider여도 fallback model이 다르면 fallback을 시도한다", async () => {
    generateDebateChunkMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('{"summary":"fallback ok","detail":"ok","indicatorLabel":"RSI","indicatorValue":"61","stance":"bullish"}');

    const { generateCharacterDebateChunk } = await import("@/infrastructure/api/llmRouter");

    const result = await generateCharacterDebateChunk({
      coinId: "bitcoin",
      characterId: "judy",
      llmInput: {
        characterId: "judy",
        characterName: "Judy",
        team: "bull",
        specialty: "뉴스",
        coinSymbol: "BTC",
        focusSummary: "summary",
        evidence: ["뉴스 감성 0.3"],
        previousMessages: [],
      },
    });

    expect(result?.content).toContain("fallback ok");
    expect(result?.provider).toBe("openrouter");
    expect(result?.model).toBe("qwen/qwen3.5-9b");
    expect(result?.fallbackUsed).toBe(true);
    expect(generateDebateChunkMock).toHaveBeenCalledTimes(2);
    expect(setCachedLlmResponseMock).toHaveBeenCalled();
  });
});
