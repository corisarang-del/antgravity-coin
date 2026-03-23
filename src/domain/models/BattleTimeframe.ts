import { z } from "zod";

export const battleTimeframes = ["5m", "30m", "1h", "4h", "24h", "7d"] as const;

export const BattleTimeframeSchema = z.enum(battleTimeframes);

export type BattleTimeframe = z.infer<typeof BattleTimeframeSchema>;
