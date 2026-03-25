import type { GenerateDebateChunkInput, LlmProvider } from "@/application/ports/LlmProvider";
import {
  buildCharacterSystemPrompt,
  buildCharacterUserPrompt,
} from "@/application/prompts/characterPrompts";
import { envConfig } from "@/shared/constants/envConfig";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export const geminiProvider: LlmProvider = {
  provider: "gemini",
  async generateDebateChunk(input: GenerateDebateChunkInput, model: string, timeoutMs = 12000) {
    if (!envConfig.geminiApiKey) {
      console.warn(
        `[battle-llm:error] character=${input.characterId} provider=gemini model=${model} reason=missing_api_key`,
      );
      return null;
    }

    const baseUrl =
      envConfig.geminiApiUrl || "https://generativelanguage.googleapis.com/v1beta/models";
    const url = `${baseUrl}/${model}:generateContent?key=${envConfig.geminiApiKey}`;

    try {
      const controller = new AbortController();
      const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: buildCharacterSystemPrompt(input),
              },
            ],
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: buildCharacterUserPrompt(input),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.6,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutHandle);

      if (!response.ok) {
        console.warn(
          `[battle-llm:error] character=${input.characterId} provider=gemini model=${model} reason=http_status status=${response.status}`,
        );
        return null;
      }

      const data = (await response.json()) as GeminiResponse;
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch (error) {
      const reason =
        error instanceof DOMException && error.name === "AbortError" ? "timeout" : "network_or_unknown";
      console.warn(
        `[battle-llm:error] character=${input.characterId} provider=gemini model=${model} reason=${reason} timeoutMs=${timeoutMs}`,
      );
      return null;
    }
  },
};
