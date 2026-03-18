import type { GenerateDebateChunkInput, LlmProvider } from "@/application/ports/LlmProvider";
import {
  buildLlmResponseCacheKey,
  getCachedLlmResponse,
  setCachedLlmResponse,
} from "@/infrastructure/cache/llmResponseCache";
import { getRuntimeCharacterModelRoute } from "@/infrastructure/config/providerRuntimeConfig";
import { geminiProvider } from "@/infrastructure/api/geminiProvider";
import { openRouterProvider } from "@/infrastructure/api/openRouterProvider";

const providers: Record<string, LlmProvider> = {
  openrouter: openRouterProvider,
  gemini: geminiProvider,
};

export interface DebateChunkResult {
  content: string | null;
  provider: string;
  model: string;
  fallbackUsed: boolean;
}

export async function generateCharacterDebateChunk(input: {
  coinId: string;
  characterId: string;
  llmInput: GenerateDebateChunkInput;
}): Promise<DebateChunkResult | null> {
  const route = getRuntimeCharacterModelRoute(input.characterId);
  if (!route) {
    return null;
  }

  const cacheKey = buildLlmResponseCacheKey({
    coinId: input.coinId,
    characterId: input.characterId,
    focusSummary: input.llmInput.focusSummary,
    evidence: input.llmInput.evidence,
    recentBattleLessons: input.llmInput.recentBattleLessons,
    characterLessons: input.llmInput.characterLessons,
    previousMessagesSummary: input.llmInput.previousMessages.map((message) => message.summary),
  });

  const cached = getCachedLlmResponse(cacheKey);
  if (cached) {
    return {
      content: cached,
      provider: route.provider,
      model: route.model,
      fallbackUsed: false,
    };
  }

  const provider = providers[route.provider];
  const fallbackProvider = providers[route.fallbackProvider];
  const primaryResponse =
    provider && (await provider.generateDebateChunk(input.llmInput, route.model, route.timeoutMs));
  const shouldTryFallback =
    !primaryResponse &&
    fallbackProvider &&
    (route.fallbackProvider !== route.provider || route.fallbackModel !== route.model);
  const fallbackResponse =
    shouldTryFallback &&
    (await fallbackProvider.generateDebateChunk(
      input.llmInput,
      route.fallbackModel,
      route.timeoutMs,
    ));
  const response = primaryResponse || fallbackResponse || null;
  const result: DebateChunkResult = {
    content: response,
    provider: primaryResponse ? route.provider : route.fallbackProvider,
    model: primaryResponse ? route.model : route.fallbackModel,
    fallbackUsed: !primaryResponse && Boolean(fallbackResponse),
  };

  console.log(
    `[battle-llm] character=${input.characterId} provider=${result.provider} model=${result.model} fallbackUsed=${result.fallbackUsed}`,
  );

  setCachedLlmResponse(cacheKey, response, route.cacheTtlSeconds);
  return result;
}
