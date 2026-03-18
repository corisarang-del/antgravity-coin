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
    return `${sourceName} 기사 흐름은 대체로 긍정적이야.`;
  }

  if (sentimentScore <= -0.2) {
    return `${sourceName} 기사 흐름은 대체로 부정적이야.`;
  }

  return `${sourceName} 기사 흐름은 중립에 가까워.`;
}
