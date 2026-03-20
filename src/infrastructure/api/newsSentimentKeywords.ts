const newsKeywordMap: Record<string, string[]> = {
  BTC: ["BTC", "Bitcoin"],
  ETH: ["ETH", "Ethereum"],
  XRP: ["XRP", "Ripple"],
  SOL: ["SOL", "Solana"],
  BNB: ["BNB", "Binance Coin"],
  DOGE: ["DOGE", "Dogecoin"],
  ADA: ["ADA", "Cardano"],
  LINK: ["LINK", "Chainlink"],
  TON: ["TON", "Toncoin"],
  SUI: ["SUI", "Sui"],
};

const bullishKeywords = ["surge", "breakout", "adoption", "approval", "gain", "rally", "bullish"];
const bearishKeywords = ["hack", "lawsuit", "selloff", "drop", "bearish", "dump", "risk"];

export function getNewsKeywordCandidates(symbol: string) {
  return newsKeywordMap[symbol.toUpperCase()] ?? [symbol.toUpperCase()];
}

export function getPrimaryNewsKeyword(symbol: string) {
  const candidates = getNewsKeywordCandidates(symbol);
  return candidates[candidates.length - 1];
}

export function buildNewsSearchQuery(symbol: string) {
  return getNewsKeywordCandidates(symbol)
    .map((keyword) => `"${keyword}"`)
    .join(" OR ");
}

export function scoreNewsTitle(title: string) {
  const normalizedTitle = title.toLowerCase();
  let score = 0;

  for (const keyword of bullishKeywords) {
    if (normalizedTitle.includes(keyword)) {
      score += 1;
    }
  }

  for (const keyword of bearishKeywords) {
    if (normalizedTitle.includes(keyword)) {
      score -= 1;
    }
  }

  return score;
}

export function scoreNewsTitles(titles: string[]) {
  if (titles.length === 0) {
    return 0;
  }

  const scores = titles.map((title) => Math.max(-1, Math.min(1, scoreNewsTitle(title) / 3)));
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Number(Math.max(-1, Math.min(1, average)).toFixed(2));
}

export function summarizeSentiment(sentimentScore: number, sourceName: string) {
  if (sentimentScore >= 0.2) {
    return `${sourceName} 기사 톤은 대체로 긍정적이야.`;
  }

  if (sentimentScore <= -0.2) {
    return `${sourceName} 기사 톤은 대체로 부정적이야.`;
  }

  return `${sourceName} 기사 톤은 중립에 가까워.`;
}

export function pickTopHeadlines(titles: string[], maxCount = 3) {
  const uniqueTitles = titles
    .map((title) => title.trim())
    .filter(Boolean)
    .filter((title, index, array) => array.findIndex((item) => item.toLowerCase() === title.toLowerCase()) === index);

  return uniqueTitles.slice(0, maxCount);
}

export function summarizeNewsEvent(
  headlines: string[],
  sentimentScore: number,
  sourceName: string,
) {
  if (headlines.length === 0) {
    return `${sourceName} 기준으로 뚜렷한 이벤트 헤드라인을 확보하지 못했어.`;
  }

  const leadHeadline = headlines[0];
  const tone =
    sentimentScore >= 0.2
      ? "긍정 재료가 더 강하게 읽혀."
      : sentimentScore <= -0.2
        ? "부정 재료가 더 무겁게 읽혀."
        : "재료 방향은 아직 중립에 가까워.";

  return `${sourceName} 대표 헤드라인은 "${leadHeadline}"이고, 전체 톤은 ${tone}`;
}
