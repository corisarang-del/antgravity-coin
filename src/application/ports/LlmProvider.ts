import type { DebateMessage } from "@/domain/models/DebateMessage";

export type LlmProviderName =
  | "anthropic"
  | "openrouter"
  | "gemini"
  | "qwen"
  | "kimi"
  | "glm"
  | "deepseek"
  | "minimax"
  | "nvidia"
  | "stepfun";

export interface GenerateDebateChunkInput {
  characterId: string;
  characterName: string;
  role: string;
  team: "bull" | "bear";
  specialty: string;
  personality: string;
  selectionReason: string;
  coinSymbol: string;
  focusSummary: string;
  evidence: string[];
  previousMessages: DebateMessage[];
}

export interface LlmProvider {
  readonly provider: LlmProviderName;
  generateDebateChunk(
    input: GenerateDebateChunkInput,
    model: string,
    timeoutMs?: number,
  ): Promise<string | null>;
}
