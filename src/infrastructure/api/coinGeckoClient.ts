import { envConfig } from "@/shared/constants/envConfig";
import { fetchWithTimeout } from "@/shared/utils/fetchWithTimeout";

const BASE_URL = "https://api.coingecko.com/api/v3";
const COINGECKO_TIMEOUT_MS = 4_000;

function buildHeaders() {
  const headers = new Headers({
    accept: "application/json",
  });

  if (envConfig.coinGeckoApiKey) {
    headers.set("x-cg-demo-api-key", envConfig.coinGeckoApiKey);
  }

  return headers;
}

export async function coinGeckoFetch<T>(path: string): Promise<T> {
  const response = await fetchWithTimeout(`${BASE_URL}${path}`, {
    headers: buildHeaders(),
    next: { revalidate: 60 },
    timeoutMs: COINGECKO_TIMEOUT_MS,
  });

  if (!response.ok) {
    throw new Error(`CoinGecko request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
