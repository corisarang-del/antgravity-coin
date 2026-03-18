import { fetchAlphaVantageNewsSentiment } from "@/infrastructure/api/alphaVantageNewsClient";
import { fetchGdeltNewsSentiment } from "@/infrastructure/api/gdeltNewsClient";
import { fetchNewsApiSentiment } from "@/infrastructure/api/newsApiClient";

export async function fetchNewsSentiment(symbol: string) {
  const steps = [
    () => fetchAlphaVantageNewsSentiment(symbol),
    () => fetchGdeltNewsSentiment(symbol),
    () => fetchNewsApiSentiment(symbol),
  ];

  const errors: string[] = [];

  for (const step of steps) {
    try {
      return await step();
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "unknown_error");
    }
  }

  throw new Error(`news sentiment unavailable: ${errors.join(" | ")}`);
}
