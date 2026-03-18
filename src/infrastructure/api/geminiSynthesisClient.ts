import { buildSynthesisPrompt } from "@/application/prompts/synthesisPrompt";
import type { BattleOutcomeSeed } from "@/domain/models/BattleOutcomeSeed";
import type { CharacterMemorySeed } from "@/domain/models/CharacterMemorySeed";
import type { PlayerDecisionSeed } from "@/domain/models/PlayerDecisionSeed";
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

export async function synthesizeBattleReportWithGemini(input: {
  battleOutcomeSeed: BattleOutcomeSeed;
  characterMemorySeeds: CharacterMemorySeed[];
  playerDecisionSeed: PlayerDecisionSeed;
}) {
  if (!envConfig.geminiApiKey) {
    return null;
  }

  const baseUrl =
    envConfig.geminiApiUrl || "https://generativelanguage.googleapis.com/v1beta/models";
  const url = `${baseUrl}/gemini-2.5-pro:generateContent?key=${envConfig.geminiApiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: buildSynthesisPrompt(input) }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

      const data = (await response.json()) as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      if (text) {
        console.log(
          `[battle-report] source=gemini battleId=${input.battleOutcomeSeed.battleId} model=gemini-2.5-pro`,
        );
      }
      return text;
    } catch {
      return null;
    }
}
