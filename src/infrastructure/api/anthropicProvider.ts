import type { GenerateDebateChunkInput, LlmProvider } from "@/application/ports/LlmProvider";
import { generateClaudeDebateChunk } from "@/infrastructure/api/claudeClient";

export const anthropicProvider: LlmProvider = {
  provider: "anthropic",
  async generateDebateChunk(input: GenerateDebateChunkInput) {
    return generateClaudeDebateChunk({
      characterName: input.characterName,
      team: input.team,
      specialty: input.specialty,
      coinSymbol: input.coinSymbol,
      marketSummary: input.focusSummary,
      previousMessages: input.previousMessages,
    });
  },
};
