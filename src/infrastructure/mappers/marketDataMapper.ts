import type { MarketData } from "@/domain/models/MarketData";

export function marketDataToSummary(data: MarketData) {
  const headlineParts = [`${data.symbol} RSI ${data.rsi.toFixed(1)}`];

  if (data.fearGreedIndex !== null) {
    headlineParts.push(`공포탐욕 ${data.fearGreedIndex}`);
  }

  const indicators = [
    { label: "RSI", value: data.rsi.toFixed(1) },
    { label: "MACD", value: data.macd.toFixed(2) },
    data.fearGreedIndex !== null ? { label: "공포탐욕", value: `${data.fearGreedIndex}` } : null,
    data.longShortRatio !== null ? { label: "롱숏 비율", value: data.longShortRatio.toFixed(2) } : null,
    data.fundingRate !== null ? { label: "펀딩비", value: `${data.fundingRate.toFixed(4)}%` } : null,
  ].filter((indicator): indicator is { label: string; value: string } => indicator !== null);

  return {
    headline: headlineParts.join(", "),
    bias:
      data.priceChange24h >= 0
        ? "단기 상승 모멘텀이 우세하지만 과열 여부를 함께 봐야 한다."
        : "단기 하락 압력이 있지만 반등 여지도 함께 열려 있다.",
    indicators,
  };
}
