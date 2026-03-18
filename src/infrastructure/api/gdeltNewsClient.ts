import { getPrimaryNewsKeyword, scoreNewsTitles, summarizeSentiment } from "@/infrastructure/api/newsSentimentKeywords";

interface GdeltArticle {
  title?: string;
}

interface GdeltResponse {
  articles?: GdeltArticle[];
}

export async function fetchGdeltNewsSentiment(symbol: string) {
  const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  url.searchParams.set("query", getPrimaryNewsKeyword(symbol));
  url.searchParams.set("mode", "ArtList");
  url.searchParams.set("maxrecords", "25");
  url.searchParams.set("format", "json");
  url.searchParams.set("sort", "DateDesc");

  const response = await fetch(url, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`GDELT request failed: ${response.status}`);
  }

  const data = (await response.json()) as GdeltResponse;
  const articles = data.articles ?? [];

  if (articles.length === 0) {
    throw new Error("GDELT response empty");
  }

  const sentimentScore = scoreNewsTitles(articles.map((article) => article.title ?? "").filter(Boolean));

  return {
    sentimentScore,
    summary: summarizeSentiment(sentimentScore, "GDELT"),
    source: "gdelt" as const,
  };
}
