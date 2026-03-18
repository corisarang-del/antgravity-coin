import type { CoinSummary } from "@/shared/constants/mockCoins";

interface CoinPriceBadgeProps {
  coin: CoinSummary;
}

export function CoinPriceBadge({ coin }: CoinPriceBadgeProps) {
  const isBull = coin.change24h >= 0;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold">
      <span className="text-foreground">{coin.price}</span>
      <span
        className={`rounded-full px-2 py-1 ${isBull ? "bg-bull/12 text-bull" : "bg-bear/12 text-bear"}`}
      >
        {isBull ? "+" : ""}
        {coin.change24h.toFixed(2)}%
      </span>
    </div>
  );
}
