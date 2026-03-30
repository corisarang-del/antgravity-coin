import type { GenerateDebateChunkInput, LlmProvider } from "@/application/ports/LlmProvider";
import { buildCharacterSystemPrompt, buildCharacterUserPrompt } from "@/application/prompts/characterPrompts";
import { envConfig } from "@/shared/constants/envConfig";

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const unavailableUntilByModel = new Map<string, number>();

function markModelUnavailable(model: string, cooldownMs: number) {
  unavailableUntilByModel.set(model, Date.now() + cooldownMs);
}

function clearModelUnavailable(model: string) {
  unavailableUntilByModel.delete(model);
}

function isModelUnavailable(model: string) {
  const unavailableUntil = unavailableUntilByModel.get(model);
  if (!unavailableUntil) {
    return false;
  }

  if (Date.now() >= unavailableUntil) {
    unavailableUntilByModel.delete(model);
    return false;
  }

  return true;
}

function getCooldownMsForStatus(status: number) {
  if (status === 404) {
    return 1000 * 60 * 60 * 6;
  }

  if (status === 429) {
    return 1000 * 60 * 30;
  }

  if (status >= 500) {
    return 1000 * 60 * 10;
  }

  return 0;
}

export const openRouterProvider: LlmProvider = {
  provider: "openrouter",
  async generateDebateChunk(input: GenerateDebateChunkInput, model: string, timeoutMs = 12000) {
    if (!envConfig.openRouterApiKey) {
      console.warn(
        `[battle-llm:error] character=${input.characterId} provider=openrouter model=${model} reason=missing_api_key`,
      );
      return null;
    }

    if (isModelUnavailable(model)) {
      console.warn(
        `[battle-llm:error] character=${input.characterId} provider=openrouter model=${model} reason=temporarily_unavailable`,
      );
      return null;
    }

    let responseBody = "";
    try {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(envConfig.openRouterBaseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${envConfig.openRouterApiKey}`,
          "HTTP-Referer": "https://ant-gravity.local",
          "X-OpenRouter-Title": "Ant Gravity Coin",
        },
        body: JSON.stringify({
          model,
          temperature: 0.6,
          messages: [
            {
              role: "system",
              content: buildCharacterSystemPrompt(input),
            },
            {
              role: "user",
              content: buildCharacterUserPrompt(input),
            },
          ],
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutHandle);

      if (!response.ok) {
        responseBody = await response.text();
        const cooldownMs = getCooldownMsForStatus(response.status);
        if (cooldownMs > 0) {
          markModelUnavailable(model, cooldownMs);
        }
        console.warn(
          `[battle-llm:error] character=${input.characterId} provider=openrouter model=${model} reason=http_status status=${response.status} responseBodyLength=${responseBody.length}`,
        );
        return null;
      }

      responseBody = await response.text();
      clearModelUnavailable(model);

      let data: OpenRouterResponse;
      try {
        data = JSON.parse(responseBody) as OpenRouterResponse;
      } catch {
        console.warn(
          `[battle-llm:error] character=${input.characterId} provider=openrouter model=${model} reason=parse_failed responseBodyLength=${responseBody.length}`,
        );
        return null;
      }

      const content = data.choices?.[0]?.message?.content ?? null;
      if (!content) {
        console.warn(
          `[battle-llm:error] character=${input.characterId} provider=openrouter model=${model} reason=empty_content responseBodyLength=${responseBody.length}`,
        );
      }
      return content;
    } catch (error) {
      const reason =
        error instanceof DOMException && error.name === "AbortError" ? "timeout" : "network_or_unknown";
      markModelUnavailable(
        model,
        reason === "timeout" ? 1000 * 60 * 5 : 1000 * 60 * 2,
      );
      console.warn(
        `[battle-llm:error] character=${input.characterId} provider=openrouter model=${model} reason=${reason} timeoutMs=${timeoutMs}`,
      );
      return null;
    }
  },
};
