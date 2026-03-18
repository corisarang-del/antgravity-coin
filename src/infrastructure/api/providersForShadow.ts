import { anthropicProvider } from "@/infrastructure/api/anthropicProvider";
import { geminiProvider } from "@/infrastructure/api/geminiProvider";
import { openRouterProvider } from "@/infrastructure/api/openRouterProvider";

export const providersForShadow = {
  anthropic: anthropicProvider,
  gemini: geminiProvider,
  openrouter: openRouterProvider,
};
