interface CachedLlmResponse {
  expiresAt: number;
  value: string | null;
}

const llmResponseCache = new Map<string, CachedLlmResponse>();

export function buildLlmResponseCacheKey(input: {
  coinId: string;
  characterId: string;
  focusSummary: string;
  evidence: string[];
  previousMessagesSummary: string[];
}) {
  return JSON.stringify(input);
}

export function getCachedLlmResponse(key: string) {
  const entry = llmResponseCache.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    llmResponseCache.delete(key);
    return null;
  }

  return entry.value;
}

export function setCachedLlmResponse(key: string, value: string | null, ttlSeconds: number) {
  llmResponseCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}
