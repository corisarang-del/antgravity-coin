import { envConfig } from "@/shared/constants/envConfig";
import {
  buildNewsSearchQuery,
  pickTopHeadlines,
  scoreNewsTitles,
  summarizeNewsEvent,
  summarizeSentiment,
} from "@/infrastructure/api/newsSentimentKeywords";

interface NewsApiArticle {
  title?: string;
}

interface NewsApiResponse {
  articles?: NewsApiArticle[];
}

export async function fetchNewsApiSentiment(symbol: string) {
  if (!envConfig.newsApiKey) {
    throw new Error("NEWS_API_KEY is required");
  }

  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", buildNewsSearchQuery(symbol));
  url.searchParams.set("language", "en");
  url.searchParams.set("searchIn", "title");
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("pageSize", "25");
  url.searchParams.set("apiKey", envConfig.newsApiKey);

  const response = await fetch(url, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`NewsAPI request failed: ${response.status}`);
  }

  const data = (await response.json()) as NewsApiResponse;
  const articles = data.articles ?? [];

  if (articles.length === 0) {
    throw new Error("NewsAPI response empty");
  }

  const headlines = pickTopHeadlines(articles.map((article) => article.title ?? "").filter(Boolean));
  const sentimentScore = scoreNewsTitles(articles.map((article) => article.title ?? "").filter(Boolean));

  return {
    sentimentScore,
    summary: summarizeSentiment(sentimentScore, "NewsAPI"),
    headlines,
    eventSummary: summarizeNewsEvent(headlines, sentimentScore, "NewsAPI"),
    source: "newsapi" as const,
  };
}
