import { prewarmPreparedBattleContext } from "@/application/useCases/preparedBattleContext";
import { cachePolicy } from "@/shared/constants/cachePolicy";

export async function prewarmMarketCache(coinIds: readonly string[] = cachePolicy.prewarmCoinIds) {
  const results = await Promise.all(
    coinIds.map(async (coinId) => {
      try {
        const context = await prewarmPreparedBattleContext(coinId);
        return {
          coinId,
          ok: true,
          symbol: context.marketData.symbol,
          prepared: true,
        };
      } catch (error) {
        return {
          coinId,
          ok: false,
          prepared: false,
          error: error instanceof Error ? error.message : "unknown_error",
        };
      }
    }),
  );

  return results;
}
