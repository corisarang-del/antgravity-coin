import type { CoinRepository } from "@/application/ports/CoinRepository";

export async function searchCoins(repository: CoinRepository, query: string) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  return repository.searchCoins(normalizedQuery);
}
