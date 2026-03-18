import type { LlmProviderName } from "@/application/ports/LlmProvider";
import { characterDebateProfiles } from "@/shared/constants/characterDebateProfiles";

export interface CharacterModelRoute {
  characterId: string;
  tier: "cheap" | "balanced" | "premium";
  provider: LlmProviderName;
  model: string;
  fallbackProvider: LlmProviderName;
  fallbackModel: string;
  timeoutMs: number;
  cacheTtlSeconds: number;
}

export const characterModelRoutes: Record<string, CharacterModelRoute> = Object.fromEntries(
  Object.values(characterDebateProfiles).map((profile) => [
    profile.characterId,
    {
      characterId: profile.characterId,
      ...profile.modelRoute,
    },
  ]),
) as Record<string, CharacterModelRoute>;

export function getCharacterModelRoute(characterId: string) {
  return characterModelRoutes[characterId];
}

export const finalSynthesisRoute = {
  provider: "gemini",
  model: "gemini-2.5-pro",
  timeoutMs: 15000,
} as const;
