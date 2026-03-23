"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const closeTimeoutRef = useRef<number | null>(null);
  const { saveRecentCoin } = useRecentCoins();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchCoinResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);

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

    const normalizedQuery = deferredQuery.trim();

    if (!normalizedQuery) {
      startTransition(() => {
        setResults(isOpen ? fallbackResults : []);
      });
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/coins/search?q=${encodeURIComponent(normalizedQuery)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { coins: SearchCoinResult[] };
        startTransition(() => {
          setResults(data.coins);
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          startTransition(() => {
            setResults([]);
          });
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [debounceMs, deferredQuery, fallbackResults, isOpen]);

  useEffect(() => {
    if (!results.length) {
      setActiveIndex(0);
      return;
    }

    setActiveIndex((current) => Math.min(current, results.length - 1));
  }, [results]);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openSuggestionList = () => {
    clearCloseTimeout();
    setIsOpen(true);
  };

  const closeSuggestionList = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => {
      setIsOpen(false);
    }, 120);
  };

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

  const showEmptyState =
    isOpen && deferredQuery.trim().length > 0 && !isLoading && results.length === 0;
  const showSuggestions = isOpen && (results.length > 0 || showEmptyState);

  return (
    <section className="min-w-0 rounded-[28px] border border-border bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_18px_44px_rgba(17,29,61,0.08)]">
      <div className="mb-4 flex flex-col gap-2">
        <p className="max-w-full font-display whitespace-nowrap text-[clamp(1.35rem,3.5vw,1.85rem)] font-bold leading-none tracking-[-0.06em]">
          어떤 코인으로 붙을지 골라줘
        </p>
        <p className="ag-body-copy ag-body-copy-strong">
          코인을 찾으면 불리시와 베어리시 8명 토론을 바로 시작할 수 있어.
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
        aria-busy={isLoading}
        aria-controls={listboxId}
        aria-expanded={showSuggestions}
        className="min-h-12 w-full rounded-[18px] border border-input bg-background px-4 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
        id="coin-search"
        onBlur={closeSuggestionList}
        onChange={(event) => {
          setQuery(event.target.value);
          openSuggestionList();
        }}
        onFocus={openSuggestionList}
        onKeyDown={handleKeyDown}
        placeholder="BTC, ETH, SOL"
        role="combobox"
        value={query}
      />
      <p className="ag-body-copy ag-body-copy-strong mt-2">
        처음에는 검색창만 보여주고, 입력하거나 포커스하면 추천 코인과 자동완성을 열어줘.
      </p>

      {showSuggestions ? (
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
                className={`flex min-h-12 w-full items-center justify-between rounded-[18px] border px-4 py-3 text-left transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  activeIndex === index
                    ? "border-primary/25 bg-card shadow-[0_12px_24px_rgba(17,29,61,0.08)]"
                    : "border-transparent bg-[hsl(var(--surface-2))] hover:border-primary/20 hover:bg-card"
                }`}
                id={`${listboxId}-${coin.id}`}
                onClick={() => navigateToBattle(coin)}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
                type="button"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-card text-sm font-bold text-muted-foreground">
                    {coin.thumb.slice(0, 1)}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{coin.symbol}</span>
                    <span className="block truncate text-xs text-muted-foreground">{coin.name}</span>
                  </span>
                </div>
                <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                  {isLoading ? "검색 중" : "선택"}
                </span>
              </button>
            </li>
          ))}
          {showEmptyState ? (
            <li className="ag-body-copy ag-body-copy-strong rounded-[18px] bg-card px-4 py-4" role="status">
              검색 결과가 없어. 다른 심볼이나 이름으로 다시 찾아줘.
            </li>
          ) : null}
        </ul>
      ) : (
        <div className="ag-body-copy ag-body-copy-strong mt-4 rounded-[20px] border border-dashed border-border/80 bg-[hsl(var(--surface-2)/0.45)] px-4 py-4">
          검색을 시작하면 추천 코인과 자동완성 결과를 바로 보여줄게.
        </div>
      )}
    </section>
  );
}
