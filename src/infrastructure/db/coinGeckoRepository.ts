import type { CoinRepository, SearchCoinResult } from "@/application/ports/CoinRepository";
import { coinGeckoFetch } from "@/infrastructure/api/coinGeckoClient";
import { topCoins, type CoinSummary } from "@/shared/constants/mockCoins";

interface CoinGeckoMarketCoin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  market_cap: number;
}

interface CoinGeckoSearchResponse {
  coins: Array<{
    id: string;
    symbol: string;
    name: string;
    thumb: string;
  }>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

function formatMarketCap(value: number) {
  if (value >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  }

  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(0)}B`;
  }

  return `$${(value / 1_000_000).toFixed(0)}M`;
}

function mapFallbackSearch(query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return topCoins
    .filter((coin) =>
      [coin.symbol, coin.name].some((value) => value.toLowerCase().includes(normalizedQuery)),
    )
    .slice(0, 5)
    .map((coin) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      thumb: coin.thumb,
    }));
}

export class CoinGeckoRepository implements CoinRepository {
  async searchCoins(query: string): Promise<SearchCoinResult[]> {
    try {
      const response = await coinGeckoFetch<CoinGeckoSearchResponse>(
        `/search?query=${encodeURIComponent(query)}`,
      );

      return response.coins.slice(0, 5).map((coin) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        thumb: coin.thumb,
      }));
    } catch {
      return mapFallbackSearch(query);
    }
  }

  async fetchTopCoins(): Promise<CoinSummary[]> {
    try {
      const response = await coinGeckoFetch<CoinGeckoMarketCoin[]>(
        "/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false",
      );

      return response.map((coin) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: formatCurrency(coin.current_price),
        change24h: coin.price_change_percentage_24h ?? 0,
        marketCap: formatMarketCap(coin.market_cap),
        thesis: "실시간 시장 데이터 기반 요약은 다음 단계에서 추가된다.",
        thumb: coin.symbol.slice(0, 1).toUpperCase(),
      }));
    } catch {
      return topCoins;
    }
  }
}
