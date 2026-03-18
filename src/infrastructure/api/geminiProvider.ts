import type { GenerateDebateChunkInput, LlmProvider } from "@/application/ports/LlmProvider";
import { getCharacterDebateProfile } from "@/shared/constants/characterDebateProfiles";
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

function buildPrompt(input: GenerateDebateChunkInput) {
  const profile = getCharacterDebateProfile(input.characterId);
  return [
    `너는 ${input.characterName}이고 ${input.team === "bull" ? "불리시" : "베어리시"} 진영이다.`,
    `전문 분야: ${profile?.prompt.roleInstruction ?? input.specialty}`,
    `코인: ${input.coinSymbol}`,
    `핵심 요약: ${input.focusSummary}`,
    `근거: ${input.evidence.join(" / ") || "없음"}`,
    `이전 발언: ${input.previousMessages.map((message) => message.summary).join(" | ") || "없음"}`,
    ...(profile?.prompt.systemRules ?? ["summary와 detail은 반드시 자연스러운 한글 문장으로만 써."]),
    profile?.prompt.userInstruction ?? "너의 역할에 맞는 해석만 짧고 명확하게, 반드시 한글로만 말해.",
    '짧은 한줄 논거와 근거 지표 한 개를 JSON으로 출력:',
    '{"summary":"","detail":"","indicatorLabel":"","indicatorValue":"","stance":"bullish|bearish"}',
  ].join("\n");
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
              parts: [{ text: buildPrompt(input) }],
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
