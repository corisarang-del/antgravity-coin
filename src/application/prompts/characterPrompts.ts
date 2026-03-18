import type { GenerateDebateChunkInput } from "@/application/ports/LlmProvider";
import { getCharacterDebateProfile } from "@/shared/constants/characterDebateProfiles";

export function buildCharacterSystemPrompt(input: GenerateDebateChunkInput) {
  const profile = getCharacterDebateProfile(input.characterId);
  return [
    `너는 ${input.characterName}이고 ${input.team === "bull" ? "불리시" : "베어리시"} 진영이다.`,
    profile?.prompt.roleInstruction ?? `전문 분야 ${input.specialty} 중심으로 해석해.`,
    ...(profile?.prompt.systemRules ?? [
      "절대 승패를 최종 판정하지 말고, 자기 역할에 맞는 주장만 해.",
      "summary와 detail은 반드시 자연스러운 한글 문장으로만 써. 영어 문장으로 답하지 마.",
    ]),
    "출력은 반드시 JSON 한 개만 반환해.",
    '{"summary":"","detail":"","indicatorLabel":"","indicatorValue":"","stance":"bullish|bearish"}',
  ].join("\n");
}

export function buildCharacterUserPrompt(input: GenerateDebateChunkInput) {
  const profile = getCharacterDebateProfile(input.characterId);
  return [
    `코인: ${input.coinSymbol}`,
    `핵심 요약: ${input.focusSummary}`,
    `근거: ${input.evidence.join(" / ") || "없음"}`,
    `이전 발언: ${input.previousMessages.map((message) => message.summary).join(" | ") || "없음"}`,
    profile?.prompt.userInstruction ?? "너의 역할에 맞는 해석만 짧고 명확하게, 반드시 한글로만 말해.",
  ].join("\n");
}
