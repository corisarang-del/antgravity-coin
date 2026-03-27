import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearRuntimeCharacterModelRouteOverrides,
  setRuntimeCharacterModelRoute,
} from "@/infrastructure/config/providerRuntimeConfig";

const generateOpenRouterChunkMock = vi.fn();
const generateGeminiChunkMock = vi.fn();
const getCachedLlmResponseMock = vi.fn();
const setCachedLlmResponseMock = vi.fn();

vi.mock("@/infrastructure/api/openRouterProvider", () => ({
  openRouterProvider: {
    provider: "openrouter",
    generateDebateChunk: generateOpenRouterChunkMock,
  },
}));

vi.mock("@/infrastructure/api/geminiProvider", () => ({
  geminiProvider: {
    provider: "gemini",
    generateDebateChunk: generateGeminiChunkMock,
  },
}));

vi.mock("@/infrastructure/cache/llmResponseCache", () => ({
  buildLlmResponseCacheKey: vi.fn().mockReturnValue("cache-key"),
  getCachedLlmResponse: getCachedLlmResponseMock,
  setCachedLlmResponse: setCachedLlmResponseMock,
}));

describe("generateCharacterDebateChunk", () => {
  beforeEach(() => {
    generateOpenRouterChunkMock.mockReset();
    generateGeminiChunkMock.mockReset();
    getCachedLlmResponseMock.mockReset();
    setCachedLlmResponseMock.mockReset();
    getCachedLlmResponseMock.mockReturnValue(null);
    clearRuntimeCharacterModelRouteOverrides();
  });

  it("같은 openrouter provider여도 fallback model이 다르면 fallback을 시도한다", async () => {
    setRuntimeCharacterModelRoute({
      characterId: "judy",
      tier: "cheap",
      provider: "openrouter",
      model: "arcee-ai/trinity-large-preview:free",
      fallbackProvider: "openrouter",
      fallbackModel: "qwen/qwen3.5-9b",
      timeoutMs: 8000,
      cacheTtlSeconds: 60,
    });

    generateOpenRouterChunkMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(
        '{"summary":"fallback ok","detail":"ok","indicatorLabel":"RSI","indicatorValue":"61","stance":"bullish"}',
      );

    const { generateCharacterDebateChunk } = await import("@/infrastructure/api/llmRouter");

    const result = await generateCharacterDebateChunk({
      coinId: "bitcoin",
      characterId: "judy",
      llmInput: {
        characterId: "judy",
        characterName: "Judy",
        role: "뉴스 스카우터",
        team: "bull",
        specialty: "뉴스",
        personality: "재료를 먼저 보는 타입이야.",
        selectionReason: "뉴스형 캐릭터 테스트용이야.",
        coinSymbol: "BTC",
        focusSummary: "summary",
        evidence: ["뉴스 헤드라인 1", "이벤트 요약 1"],
        recentBattleLessons: [],
        characterLessons: [],
        previousMessages: [],
      },
    });

    expect(result?.content).toContain("fallback ok");
    expect(result?.provider).toBe("openrouter");
    expect(result?.model).toBe("qwen/qwen3.5-9b");
    expect(result?.fallbackUsed).toBe(true);
    expect(generateOpenRouterChunkMock).toHaveBeenCalledTimes(2);
    expect(setCachedLlmResponseMock).toHaveBeenCalled();
  });

  it("기본 fallback까지 실패하면 추가 recovery model 풀은 돌지 않는다", async () => {
    setRuntimeCharacterModelRoute({
      characterId: "judy",
      tier: "cheap",
      provider: "openrouter",
      model: "arcee-ai/trinity-large-preview:free",
      fallbackProvider: "openrouter",
      fallbackModel: "qwen/qwen3.5-9b",
      timeoutMs: 8000,
      cacheTtlSeconds: 60,
    });

    generateOpenRouterChunkMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const { generateCharacterDebateChunk } = await import("@/infrastructure/api/llmRouter");

    const result = await generateCharacterDebateChunk({
      coinId: "bitcoin",
      characterId: "judy",
      llmInput: {
        characterId: "judy",
        characterName: "Judy",
        role: "뉴스 스카우터",
        team: "bull",
        specialty: "뉴스",
        personality: "재료를 먼저 보는 타입이야.",
        selectionReason: "뉴스형 캐릭터 테스트용이야.",
        coinSymbol: "BTC",
        focusSummary: "summary",
        evidence: ["뉴스 헤드라인 1", "이벤트 요약 1"],
        recentBattleLessons: [],
        characterLessons: [],
        previousMessages: [],
      },
    });

    expect(result?.content).toBeNull();
    expect(result?.provider).toBe("openrouter");
    expect(result?.model).toBe("arcee-ai/trinity-large-preview:free");
    expect(result?.fallbackUsed).toBe(false);
    expect(generateOpenRouterChunkMock).toHaveBeenCalledTimes(2);
  });
});
