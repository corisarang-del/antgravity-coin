import { z } from "zod";

export const CoinSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  currentPrice: z.number(),
  priceChange24h: z.number(),
  marketCap: z.number(),
  thumb: z.string(),
});

export type Coin = z.infer<typeof CoinSchema>;
