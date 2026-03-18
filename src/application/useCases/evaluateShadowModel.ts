import type { GenerateDebateChunkInput } from "@/application/ports/LlmProvider";
import { providersForShadow } from "@/infrastructure/api/providersForShadow";

export async function evaluateShadowModel(input: {
  primaryProvider: keyof typeof providersForShadow;
  primaryModel: string;
  shadowProvider: keyof typeof providersForShadow;
  shadowModel: string;
  llmInput: GenerateDebateChunkInput;
}) {
  const primary = providersForShadow[input.primaryProvider];
  const shadow = providersForShadow[input.shadowProvider];

  const [primaryResult, shadowResult] = await Promise.all([
    primary?.generateDebateChunk(input.llmInput, input.primaryModel) ?? Promise.resolve(null),
    shadow?.generateDebateChunk(input.llmInput, input.shadowModel) ?? Promise.resolve(null),
  ]);

  return {
    primaryProvider: input.primaryProvider,
    shadowProvider: input.shadowProvider,
    primaryResult,
    shadowResult,
    matched: primaryResult !== null && primaryResult === shadowResult,
    evaluatedAt: new Date().toISOString(),
  };
}
