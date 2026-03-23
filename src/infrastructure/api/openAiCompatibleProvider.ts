import type { GenerateDebateChunkInput, LlmProvider, LlmProviderName } from "@/application/ports/LlmProvider";
import {
  buildCharacterSystemPrompt,
  buildCharacterUserPrompt,
} from "@/application/prompts/characterPrompts";

interface OpenAiCompatibleProviderConfig {
  provider: LlmProviderName;
  apiKey: string;
  apiUrl: string;
}

interface OpenAiCompatibleResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export function createOpenAiCompatibleProvider(
  config: OpenAiCompatibleProviderConfig,
): LlmProvider {
  return {
    provider: config.provider,
    async generateDebateChunk(input: GenerateDebateChunkInput, model: string) {
      if (!config.apiKey || !config.apiUrl) {
        return null;
      }

      try {
        const response = await fetch(config.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
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
        });

        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as OpenAiCompatibleResponse;
        return data.choices?.[0]?.message?.content ?? null;
      } catch {
        return null;
      }
    },
  };
}
