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

const curatedTopCoinIds = topCoins.map((coin) => coin.id).join(",");

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
        `/coins/markets?vs_currency=usd&ids=${curatedTopCoinIds}&order=market_cap_desc&sparkline=false`,
      );

      const liveCoinMap = new Map(response.map((coin) => [coin.id, coin]));

      return topCoins.map((fallbackCoin) => {
        const liveCoin = liveCoinMap.get(fallbackCoin.id);

        if (!liveCoin) {
          return fallbackCoin;
        }

        return {
          ...fallbackCoin,
          symbol: liveCoin.symbol.toUpperCase(),
          name: liveCoin.name,
          price: formatCurrency(liveCoin.current_price),
          change24h: liveCoin.price_change_percentage_24h ?? 0,
          marketCap: formatMarketCap(liveCoin.market_cap),
        };
      });
    } catch {
      return topCoins;
    }
  }
}
