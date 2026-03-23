import Anthropic from "@anthropic-ai/sdk";
import type { DebateMessage } from "@/domain/models/DebateMessage";
import { getCharacterDebateProfile } from "@/shared/constants/characterDebateProfiles";
import { envConfig } from "@/shared/constants/envConfig";

function buildPrompt(input: {
  characterName: string;
  team: "bull" | "bear";
  specialty: string;
  coinSymbol: string;
  marketSummary: string;
  previousMessages: DebateMessage[];
}) {
  const profile = getCharacterDebateProfile(input.characterName.toLowerCase());
  return `
너는 ${input.characterName}이고 ${input.team === "bull" ? "불리시" : "베어리시"} 진영이다.
전문 분야: ${profile?.prompt.roleInstruction ?? input.specialty}
코인: ${input.coinSymbol}
시장 요약: ${input.marketSummary}
이전 발언 요약: ${input.previousMessages.map((message) => message.summary).join(" | ") || "없음"}
${(profile?.prompt.systemRules ?? ["summary와 detail은 반드시 자연스러운 한글 문장으로만 써."]).join("\n")}
${profile?.prompt.userInstruction ?? "너의 역할에 맞는 해석만 짧고 명확하게, 반드시 한글로만 말해."}

짧은 한줄 논거와 근거 지표 한 개를 JSON으로 출력:
{"summary":"","detail":"","indicatorLabel":"","indicatorValue":"","stance":"bullish|bearish"}
`.trim();
}

export async function generateClaudeDebateChunk(input: {
  characterName: string;
  team: "bull" | "bear";
  specialty: string;
  coinSymbol: string;
  marketSummary: string;
  previousMessages: DebateMessage[];
}) {
  if (!envConfig.anthropicApiKey) {
    return null;
  }

  try {
    const client = new Anthropic({ apiKey: envConfig.anthropicApiKey });
    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 220,
      messages: [
        {
          role: "user",
          content: buildPrompt(input),
        },
      ],
    });

    const content = response.content[0];
    if (!content || content.type !== "text") {
      return null;
    }

    return content.text;
  } catch {
    return null;
  }
}
