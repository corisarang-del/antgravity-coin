import type { GenerateDebateChunkInput, LlmProvider, LlmProviderName } from "@/application/ports/LlmProvider";
import { getCharacterDebateProfile } from "@/shared/constants/characterDebateProfiles";

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
                role: "user",
                content: buildPrompt(input),
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
