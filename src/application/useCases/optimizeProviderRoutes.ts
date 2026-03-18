import type { CharacterModelRoute } from "@/shared/constants/characterModelRoutes";

export interface ProviderEvaluation {
  characterId: string;
  currentRoute: CharacterModelRoute;
  candidateRoute: CharacterModelRoute;
  failureRate: number;
  averageLatencyMs: number;
  shadowMatched: boolean;
}

export function optimizeProviderRoutes(evaluations: ProviderEvaluation[]) {
  return evaluations.map((evaluation) => {
    const shouldPromoteCandidate =
      evaluation.failureRate <= 0.1 &&
      evaluation.averageLatencyMs <= evaluation.currentRoute.timeoutMs &&
      evaluation.shadowMatched;

    return shouldPromoteCandidate ? evaluation.candidateRoute : evaluation.currentRoute;
  });
}
