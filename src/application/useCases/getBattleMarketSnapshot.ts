import { cache } from "react";
import type { MarketData } from "@/domain/models/MarketData";
import { fetchMarketData } from "@/application/useCases/fetchMarketData";
import { marketDataToSummary } from "@/infrastructure/mappers/marketDataMapper";

export interface BattleMarketSnapshot {
  marketData: MarketData;
  summary: ReturnType<typeof marketDataToSummary>;
}

async function buildBattleMarketSnapshot(coinId: string): Promise<BattleMarketSnapshot> {
  const marketData = await fetchMarketData(coinId);
  const summary = marketDataToSummary(marketData);

  return {
    marketData,
    summary,
  };
}

export const getBattleMarketSnapshot = cache(buildBattleMarketSnapshot);
