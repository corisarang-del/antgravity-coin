export interface CacheTtlPolicy {
  softTtlMs: number;
  hardTtlMs: number;
}

export const cachePolicy = {
  prewarmCoinIds: ["bitcoin", "ethereum", "xrp", "solana"],
  topCoinsSoftLimit: 4,
  marketSeed: {
    softTtlMs: 2 * 60 * 1000,
    hardTtlMs: 10 * 60 * 1000,
  } satisfies CacheTtlPolicy,
  fearGreed: {
    softTtlMs: 60 * 60 * 1000,
    hardTtlMs: 6 * 60 * 60 * 1000,
  } satisfies CacheTtlPolicy,
  newsSentiment: {
    softTtlMs: 15 * 60 * 1000,
    hardTtlMs: 2 * 60 * 60 * 1000,
  } satisfies CacheTtlPolicy,
  derivatives: {
    softTtlMs: 2 * 60 * 1000,
    hardTtlMs: 10 * 60 * 1000,
  } satisfies CacheTtlPolicy,
  battlePrep: {
    softTtlMs: 2 * 60 * 1000,
    hardTtlMs: 10 * 60 * 1000,
  } satisfies CacheTtlPolicy,
} as const;
