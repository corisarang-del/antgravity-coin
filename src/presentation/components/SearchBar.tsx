"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchCoinResult } from "@/application/ports/CoinRepository";
import { useRecentCoins } from "@/presentation/hooks/useRecentCoins";
import type { CoinSummary } from "@/shared/constants/mockCoins";

interface SearchBarProps {
  initialCoins: CoinSummary[];
  debounceMs?: number;
}

export function SearchBar({ initialCoins, debounceMs = 300 }: SearchBarProps) {
  const router = useRouter();
  const listboxId = useId();
  const { saveRecentCoin } = useRecentCoins();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchCoinResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const fallbackResults = useMemo(
    () =>
      initialCoins.slice(0, 4).map((coin) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        thumb: coin.thumb,
      })),
    [initialCoins],
  );

  useEffect(() => {
    setActiveIndex(0);

    if (!query.trim()) {
      setResults(fallbackResults);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/coins/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { coins: SearchCoinResult[] };
        setResults(data.coins);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [debounceMs, fallbackResults, query]);

  useEffect(() => {
    if (!results.length) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((current) => Math.min(current, results.length - 1));
  }, [results]);

  const navigateToBattle = (coin: SearchCoinResult) => {
    saveRecentCoin(coin);
    router.push(`/battle/${coin.id}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + results.length) % results.length);
      return;
    }

    const selectedResult = results[activeIndex] ?? results[0];

    if (event.key === "Enter" && selectedResult) {
      event.preventDefault();
      navigateToBattle(selectedResult);
    }
  };

  return (
    <section className="rounded-[28px] border border-border bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_18px_44px_rgba(17,29,61,0.08)]">
      <div className="mb-4 flex flex-col gap-2">
        <p className="font-display text-[28px] font-bold leading-none tracking-[-0.05em]">
          어떤 코인으로 붙어볼지 골라줘
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          코인을 찾으면 불리시와 베어리시의 8인 토론이 바로 시작돼.
        </p>
      </div>

      <label className="mb-3 block text-sm font-semibold" htmlFor="coin-search">
        코인 검색
      </label>
      <input
        aria-activedescendant={
          results[activeIndex] ? `${listboxId}-${results[activeIndex].id}` : undefined
        }
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={results.length > 0}
        autoFocus
        className="h-13 w-full rounded-[18px] border border-input bg-background px-4 text-sm outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        id="coin-search"
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="BTC, ETH, SOL"
        role="combobox"
        value={query}
      />

      <ul
        aria-label="코인 자동완성"
        className="mt-4 grid gap-2 rounded-[20px] bg-[hsl(var(--surface-2)/0.7)] p-2"
        id={listboxId}
        role="listbox"
      >
        {results.map((coin, index) => (
          <li key={coin.id} role="presentation">
            <button
              aria-selected={activeIndex === index}
              className={`flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-left transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 ${
                activeIndex === index
                  ? "border-primary/25 bg-card shadow-[0_12px_24px_rgba(17,29,61,0.08)]"
                  : "border-transparent bg-[hsl(var(--surface-2))] hover:border-primary/20 hover:bg-card"
              }`}
              id={`${listboxId}-${coin.id}`}
              onClick={() => navigateToBattle(coin)}
              onMouseEnter={() => setActiveIndex(index)}
              role="option"
              type="button"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card text-sm font-bold text-muted-foreground">
                  {coin.thumb.slice(0, 1)}
                </span>
                <span>
                  <span className="block font-semibold">{coin.symbol}</span>
                  <span className="block text-xs text-muted-foreground">{coin.name}</span>
                </span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {isLoading ? "검색 중" : "선택"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
