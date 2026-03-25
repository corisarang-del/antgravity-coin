function readEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

// NEXT_PUBLIC_* values must be referenced directly so Next can inline them into client bundles.
const publicSupabaseUrl = typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string"
  ? process.env.NEXT_PUBLIC_SUPABASE_URL.trim()
  : "";
const publicSupabasePublishableKey =
  typeof process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY === "string"
    ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.trim()
    : "";

export const hasSupabasePublicEnv =
  publicSupabaseUrl.length > 0 && publicSupabasePublishableKey.length > 0;

export const envConfig = {
  supabaseUrl: publicSupabaseUrl,
  supabasePublishableKey: publicSupabasePublishableKey,
  openRouterApiKey: readEnv("OPENROUTER_API_KEY"),
  openRouterBaseUrl: readEnv("OPENROUTER_BASE_URL") || "https://openrouter.ai/api/v1/chat/completions",
  anthropicApiKey: readEnv("ANTHROPIC_API_KEY"),
  coinGeckoApiKey: readEnv("COINGECKO_API_KEY"),
  alphaVantageApiKey: readEnv("ALPHA_VANTAGE_API_KEY"),
  newsApiKey: readEnv("NEWS_API_KEY"),
  geminiApiKey: readEnv("GEMINI_API_KEY"),
  geminiApiUrl: readEnv("GEMINI_API_URL"),
  charactersSource: readEnv("CHARACTERS_SOURCE") || "local",
  charactersApiUrl: readEnv("CHARACTERS_API_URL"),
} as const;
