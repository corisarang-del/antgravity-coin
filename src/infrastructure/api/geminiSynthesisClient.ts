import {
  buildLessonSynthesisPrompt,
  buildSynthesisPrompt,
} from "@/application/prompts/synthesisPrompt";
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

export interface GeminiBattleLessons {
  reportSummary: string;
  globalLessons: string[];
  characterLessons: Array<{
    characterId: string;
    characterName: string;
    lesson: string;
    wasCorrect: boolean;
  }>;
}

async function requestGemini(prompt: string) {
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
            parts: [{ text: prompt }],
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
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

function extractJsonBlock(rawText: string) {
  const fencedMatch =
    rawText.match(/```json\s*([\s\S]*?)```/i) ?? rawText.match(/```\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1] : rawText;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return candidate.slice(start, end + 1);
}

export async function synthesizeBattleReportWithGemini(input: {
  battleOutcomeSeed: BattleOutcomeSeed;
  characterMemorySeeds: CharacterMemorySeed[];
  playerDecisionSeed: PlayerDecisionSeed;
}) {
  const text = await requestGemini(buildSynthesisPrompt(input));
  if (text) {
    console.log(
      `[battle-report] source=gemini battleId=${input.battleOutcomeSeed.battleId} model=gemini-2.5-pro`,
    );
  }
  return text;
}

export async function synthesizeBattleLessonsWithGemini(input: {
  battleOutcomeSeed: BattleOutcomeSeed;
  characterMemorySeeds: CharacterMemorySeed[];
  playerDecisionSeed: PlayerDecisionSeed;
  report: string;
}): Promise<GeminiBattleLessons | null> {
  const text = await requestGemini(buildLessonSynthesisPrompt(input));
  if (!text) {
    return null;
  }

  try {
    const normalizedJson = extractJsonBlock(text);
    if (!normalizedJson) {
      return null;
    }

    const parsed = JSON.parse(normalizedJson) as GeminiBattleLessons;
    return {
      reportSummary: parsed.reportSummary?.trim() || "요약 없음",
      globalLessons: (parsed.globalLessons ?? [])
        .map((lesson) => lesson.trim())
        .filter((lesson) => lesson.length > 0)
        .slice(0, 4),
      characterLessons: (parsed.characterLessons ?? [])
        .filter(
          (lesson) =>
            lesson.characterId?.trim() &&
            lesson.characterName?.trim() &&
            lesson.lesson?.trim(),
        )
        .map((lesson) => ({
          characterId: lesson.characterId.trim(),
          characterName: lesson.characterName.trim(),
          lesson: lesson.lesson.trim(),
          wasCorrect: lesson.wasCorrect,
        }))
        .slice(0, 8),
    };
  } catch {
    return null;
  }
}
