"use client";

import Link from "next/link";
import { useRecentCoins } from "@/presentation/hooks/useRecentCoins";

export function RecentCoinsList() {
  const { recentCoins } = useRecentCoins();

  if (recentCoins.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[24px] border border-border bg-card p-5">
      <div className="mb-4">
        <h2 className="font-display text-xl font-bold tracking-[-0.04em]">최근 본 코인</h2>
        <p className="text-sm text-muted-foreground">로컬스토리지 기준 최근 5개까지 보여줘</p>
      </div>
      <ul className="grid gap-3">
        {recentCoins.map((coin) => (
          <li key={coin.id}>
            <Link
              className="flex items-center justify-between rounded-[18px] bg-[hsl(var(--surface-2))] px-4 py-3 transition hover:bg-[hsl(var(--surface-3))]"
              href={`/battle/${coin.id}`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card text-sm font-bold text-muted-foreground">
                  {coin.thumb.slice(0, 1)}
                </span>
                <div>
                  <p className="font-semibold">{coin.symbol}</p>
                  <p className="text-xs text-muted-foreground">{coin.name}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-primary">다시 보기</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
