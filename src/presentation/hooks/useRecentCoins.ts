"use client";

import { useSyncExternalStore } from "react";
import type { SearchCoinResult } from "@/application/ports/CoinRepository";

const STORAGE_KEY = "ant_gravity_recent_coins";
const MAX_RECENT_COINS = 5;
const RECENT_COINS_EVENT = "recent-coins-change";
const EMPTY_RECENT_COINS: SearchCoinResult[] = [];
let cachedRawValue: string | null = null;
let cachedRecentCoins: SearchCoinResult[] = EMPTY_RECENT_COINS;

function readRecentCoins(): SearchCoinResult[] {
  if (typeof window === "undefined") {
    return EMPTY_RECENT_COINS;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (rawValue === cachedRawValue) {
    return cachedRecentCoins;
  }

  if (!rawValue) {
    cachedRawValue = null;
    cachedRecentCoins = EMPTY_RECENT_COINS;
    return EMPTY_RECENT_COINS;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as SearchCoinResult[];
    cachedRawValue = rawValue;
    cachedRecentCoins = parsedValue.slice(0, MAX_RECENT_COINS);
    return cachedRecentCoins;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    cachedRawValue = null;
    cachedRecentCoins = EMPTY_RECENT_COINS;
    return EMPTY_RECENT_COINS;
  }
}

function emitRecentCoinsChange() {
  window.dispatchEvent(new Event(RECENT_COINS_EVENT));
}

function subscribe(onStoreChange: () => void) {
  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener(RECENT_COINS_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(RECENT_COINS_EVENT, handleChange);
  };
}

export function useRecentCoins() {
  const recentCoins = useSyncExternalStore(subscribe, readRecentCoins, () => EMPTY_RECENT_COINS);

  const saveRecentCoin = (coin: SearchCoinResult) => {
    const currentCoins = readRecentCoins();
    const nextCoins = [coin, ...currentCoins.filter((item) => item.id !== coin.id)].slice(
      0,
      MAX_RECENT_COINS,
    );
    const nextRawValue = JSON.stringify(nextCoins);
    cachedRawValue = nextRawValue;
    cachedRecentCoins = nextCoins;
    window.localStorage.setItem(STORAGE_KEY, nextRawValue);
    emitRecentCoinsChange();
  };

  return {
    recentCoins,
    saveRecentCoin,
  };
}
