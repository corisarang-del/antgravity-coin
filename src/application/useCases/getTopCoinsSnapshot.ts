import { cache } from "react";
import { fetchTopCoins } from "@/application/useCases/fetchTopCoins";
import { CoinGeckoRepository } from "@/infrastructure/db/coinGeckoRepository";

const repository = new CoinGeckoRepository();

async function buildTopCoinsSnapshot() {
  return fetchTopCoins(repository);
}

export const getTopCoinsSnapshot = cache(buildTopCoinsSnapshot);
