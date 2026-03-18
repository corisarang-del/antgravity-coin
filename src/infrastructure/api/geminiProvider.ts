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
  async generateDebateChunk(input: GenerateDebateChunkInput, model: string) {
    if (!envConfig.geminiApiKey) {
      return null;
    }

    const baseUrl =
      envConfig.geminiApiUrl || "https://generativelanguage.googleapis.com/v1beta/models";
    const url = `${baseUrl}/${model}:generateContent?key=${envConfig.geminiApiKey}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${buildCharacterSystemPrompt(input)}\n\n${buildCharacterUserPrompt(input)}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.6,
          },
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as GeminiResponse;
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch {
      return null;
    }
  },
};
