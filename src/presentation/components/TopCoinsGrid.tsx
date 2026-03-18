import Link from "next/link";
import { CoinPriceBadge } from "@/presentation/components/CoinPriceBadge";
import type { CoinSummary } from "@/shared/constants/mockCoins";

interface TopCoinsGridProps {
  coins: CoinSummary[];
}

export function TopCoinsGrid({ coins }: TopCoinsGridProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {coins.map((coin) => (
        <article
          key={coin.id}
          className="rounded-[24px] border border-border bg-card p-5 shadow-[0_18px_40px_rgba(17,29,61,0.08)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-xl font-bold tracking-[-0.04em]">{coin.symbol}</p>
              <p className="text-sm text-muted-foreground">{coin.name}</p>
            </div>
            <CoinPriceBadge coin={coin} />
          </div>
          <p className="mb-3 text-sm leading-6 text-muted-foreground">{coin.thesis}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>시가총액 {coin.marketCap}</span>
            <Link
              className="rounded-full bg-primary px-3 py-2 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              href={`/battle/${coin.id}`}
            >
              배틀 입장
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}
