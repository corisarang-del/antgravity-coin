import { z } from "zod";

export const MarketDataSchema = z.object({
  coinId: z.string(),
  symbol: z.string(),
  currentPrice: z.number(),
  priceChange24h: z.number(),
  priceChange7d: z.number(),
  rsi: z.number().min(0).max(100),
  macd: z.number(),
  bollingerUpper: z.number(),
  bollingerLower: z.number(),
  fearGreedIndex: z.number().min(0).max(100).nullable(),
  fearGreedLabel: z.string().nullable(),
  sentimentScore: z.number().min(-1).max(1).nullable(),
  newsHeadlines: z.array(z.string()),
  newsEventSummary: z.string().nullable(),
  communitySentimentSummary: z.string().nullable(),
  longShortRatio: z.number().nullable(),
  openInterest: z.number().nullable(),
  fundingRate: z.number().nullable(),
  whaleScore: z.number().min(0).max(100).nullable(),
  whaleFlowSummary: z.string().nullable(),
  marketStructureSummary: z.string().nullable(),
  volume24h: z.number(),
});

export type MarketData = z.infer<typeof MarketDataSchema>;
