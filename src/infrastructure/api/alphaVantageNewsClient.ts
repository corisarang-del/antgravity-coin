import { envConfig } from "@/shared/constants/envConfig";
import {
  pickTopHeadlines,
  scoreNewsTitles,
  summarizeNewsEvent,
  summarizeSentiment,
} from "@/infrastructure/api/newsSentimentKeywords";

interface AlphaVantageNewsItem {
  title?: string;
  overall_sentiment_score?: string;
}

interface AlphaVantageNewsResponse {
  feed?: AlphaVantageNewsItem[];
}

export async function fetchAlphaVantageNewsSentiment(symbol: string) {
  if (!envConfig.alphaVantageApiKey) {
    throw new Error("ALPHA_VANTAGE_API_KEY is required");
  }

  const url = new URL("https://www.alphavantage.co/query");
  url.searchParams.set("function", "NEWS_SENTIMENT");
  url.searchParams.set("tickers", `CRYPTO:${symbol.toUpperCase()}`);
  url.searchParams.set("limit", "25");
  url.searchParams.set("apikey", envConfig.alphaVantageApiKey);

  const response = await fetch(url, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Alpha Vantage request failed: ${response.status}`);
  }

  const data = (await response.json()) as AlphaVantageNewsResponse;
  const feed = data.feed ?? [];

  if (feed.length === 0) {
    throw new Error("Alpha Vantage response empty");
  }

  const headlines = pickTopHeadlines(feed.map((item) => item.title ?? "").filter(Boolean));
  const scoreCandidates = feed
    .map((item) => Number(item.overall_sentiment_score))
    .filter((score) => Number.isFinite(score));
  const sentimentScore =
    scoreCandidates.length > 0
      ? Number(
          Math.max(-1, Math.min(1, scoreCandidates.reduce((sum, score) => sum + score, 0) / scoreCandidates.length)).toFixed(2),
        )
      : scoreNewsTitles(feed.map((item) => item.title ?? "").filter(Boolean));

  return {
    sentimentScore,
    summary: summarizeSentiment(sentimentScore, "Alpha Vantage"),
    headlines,
    eventSummary: summarizeNewsEvent(headlines, sentimentScore, "Alpha Vantage"),
    source: "alpha-vantage" as const,
  };
}
