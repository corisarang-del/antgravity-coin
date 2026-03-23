import { z } from "zod";
import { DebateMessageSchema } from "@/domain/models/DebateMessage";
import { MarketDataSchema } from "@/domain/models/MarketData";

export const BattleSnapshotSummarySchema = z.object({
  headline: z.string(),
  bias: z.string(),
  indicators: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    }),
  ),
});

export const BattleSnapshotRecordSchema = z.object({
  snapshotId: z.string(),
  userId: z.string(),
  battleId: z.string().nullable(),
  coinId: z.string(),
  marketData: MarketDataSchema.nullable(),
  summary: BattleSnapshotSummarySchema.nullable(),
  messages: z.array(DebateMessageSchema),
  savedAt: z.string(),
});

export type BattleSnapshotRecord = z.infer<typeof BattleSnapshotRecordSchema>;
