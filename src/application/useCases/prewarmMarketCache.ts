import { prewarmPreparedBattleContext } from "@/application/useCases/preparedBattleContext";
import { cachePolicy } from "@/shared/constants/cachePolicy";

async function mapWithConcurrency<TInput, TOutput>(
  values: readonly TInput[],
  concurrency: number,
  mapper: (value: TInput, index: number) => Promise<TOutput>,
) {
  const results = new Array<TOutput>(values.length);
  let cursor = 0;

  async function worker() {
    while (cursor < values.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await mapper(values[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.min(values.length, Math.max(1, concurrency));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

export async function prewarmMarketCache(coinIds: readonly string[] = cachePolicy.prewarmCoinIds) {
  const results = await mapWithConcurrency(
    coinIds,
    cachePolicy.prewarmMaxConcurrency,
    async (coinId) => {
      const startedAt = Date.now();

      try {
        const result = await prewarmPreparedBattleContext(coinId);
        return {
          coinId,
          ok: true,
          symbol: result.context.marketData.symbol,
          prepared: result.preparedFirstTurnHit || !result.preparedContextHit,
          cacheHit: result.preparedContextHit,
          preparedAtAgeMs: result.preparedAtAgeMs,
          refreshQueued: result.refreshQueued,
          durationMs: Date.now() - startedAt,
        };
      } catch (error) {
        return {
          coinId,
          ok: false,
          prepared: false,
          refreshQueued: false,
          durationMs: Date.now() - startedAt,
          error: error instanceof Error ? error.message : "unknown_error",
        };
      }
    },
  );

  return results;
}
