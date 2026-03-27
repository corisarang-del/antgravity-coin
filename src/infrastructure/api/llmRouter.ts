import type { GenerateDebateChunkInput, LlmProvider } from "@/application/ports/LlmProvider";
import type { CharacterModelRoute } from "@/shared/constants/characterModelRoutes";
import {
  buildLlmResponseCacheKey,
  getCachedLlmResponse,
  setCachedLlmResponse,
} from "@/infrastructure/cache/llmResponseCache";
import { getRuntimeCharacterModelRoute } from "@/infrastructure/config/providerRuntimeConfig";
import { geminiProvider } from "@/infrastructure/api/geminiProvider";
import { openRouterProvider } from "@/infrastructure/api/openRouterProvider";
import { debugBattleLog } from "@/shared/utils/debugBattleLogs";

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

function buildRouteAttempts(route: CharacterModelRoute) {
  const attempts: Array<{
    provider: string;
    model: string;
    fallbackUsed: boolean;
  }> = [
    {
      provider: route.provider,
      model: route.model,
      fallbackUsed: false,
    },
  ];

  const seen = new Set([`${route.provider}:${route.model}`]);
  const configuredFallbackKey = `${route.fallbackProvider}:${route.fallbackModel}`;

  if (!seen.has(configuredFallbackKey)) {
    seen.add(configuredFallbackKey);
    attempts.push({
      provider: route.fallbackProvider,
      model: route.fallbackModel,
      fallbackUsed: true,
    });
  }

  return attempts;
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

  const attempts = buildRouteAttempts(route);
  let result: DebateChunkResult = {
    content: null,
    provider: route.provider,
    model: route.model,
    fallbackUsed: false,
  };

  for (const attempt of attempts) {
    const provider = providers[attempt.provider];
    if (!provider) {
      continue;
    }

    const response = await provider.generateDebateChunk(
      input.llmInput,
      attempt.model,
      route.timeoutMs,
    );

    if (!response) {
      continue;
    }

    result = {
      content: response,
      provider: attempt.provider,
      model: attempt.model,
      fallbackUsed: attempt.fallbackUsed,
    };
    break;
  }

  debugBattleLog(
    `[battle-llm] character=${input.characterId} provider=${result.provider} model=${result.model} fallbackUsed=${result.fallbackUsed}`,
  );

  if (result.content) {
    setCachedLlmResponse(cacheKey, result.content, route.cacheTtlSeconds);
  }

  return result;
}
