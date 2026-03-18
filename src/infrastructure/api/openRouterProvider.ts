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

export const openRouterProvider: LlmProvider = {
  provider: "openrouter",
  async generateDebateChunk(input: GenerateDebateChunkInput, model: string, timeoutMs = 12000) {
    if (!envConfig.openRouterApiKey) {
      console.warn(
        `[battle-llm:error] character=${input.characterId} provider=openrouter model=${model} reason=missing_api_key`,
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
        console.warn(
          `[battle-llm:error] character=${input.characterId} provider=openrouter model=${model} reason=http_status status=${response.status} body=${responseBody.slice(0, 240)}`,
        );
        return null;
      }

      responseBody = await response.text();

      let data: OpenRouterResponse;
      try {
        data = JSON.parse(responseBody) as OpenRouterResponse;
      } catch {
        console.warn(
          `[battle-llm:error] character=${input.characterId} provider=openrouter model=${model} reason=parse_failed body=${responseBody.slice(0, 240)}`,
        );
        return null;
      }

      const content = data.choices?.[0]?.message?.content ?? null;
      if (!content) {
        console.warn(
          `[battle-llm:error] character=${input.characterId} provider=openrouter model=${model} reason=empty_content body=${responseBody.slice(0, 240)}`,
        );
      }
      return content;
    } catch (error) {
      const reason =
        error instanceof DOMException && error.name === "AbortError" ? "timeout" : "network_or_unknown";
      console.warn(
        `[battle-llm:error] character=${input.characterId} provider=openrouter model=${model} reason=${reason} timeoutMs=${timeoutMs}`,
      );
      return null;
    }
  },
};
