import type { CoinRepository } from "@/application/ports/CoinRepository";

export async function fetchTopCoins(repository: CoinRepository) {
  return repository.fetchTopCoins();
}
