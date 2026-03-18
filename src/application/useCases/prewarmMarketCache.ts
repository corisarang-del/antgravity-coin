import { fetchMarketData } from "@/application/useCases/fetchMarketData";
import { cachePolicy } from "@/shared/constants/cachePolicy";

export async function prewarmMarketCache(coinIds: readonly string[] = cachePolicy.prewarmCoinIds) {
  const results = await Promise.all(
    coinIds.map(async (coinId) => {
      try {
        const marketData = await fetchMarketData(coinId);
        return {
          coinId,
          ok: true,
          symbol: marketData.symbol,
        };
      } catch (error) {
        return {
          coinId,
          ok: false,
          error: error instanceof Error ? error.message : "unknown_error",
        };
      }
    }),
  );

  return results;
}
