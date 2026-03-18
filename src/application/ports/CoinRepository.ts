import type { CoinSummary } from "@/shared/constants/mockCoins";

export interface SearchCoinResult {
  id: string;
  symbol: string;
  name: string;
  thumb: string;
}

export interface CoinRepository {
  searchCoins(query: string): Promise<SearchCoinResult[]>;
  fetchTopCoins(): Promise<CoinSummary[]>;
}
