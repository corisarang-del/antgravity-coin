"use client";

import { useState } from "react";
import type { SearchCoinResult } from "@/application/ports/CoinRepository";

const STORAGE_KEY = "ant_gravity_recent_coins";
const MAX_RECENT_COINS = 5;

function readRecentCoins(): SearchCoinResult[] {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as SearchCoinResult[];
    return parsedValue.slice(0, MAX_RECENT_COINS);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function useRecentCoins() {
  const [recentCoins, setRecentCoins] = useState<SearchCoinResult[]>(readRecentCoins);

  const saveRecentCoin = (coin: SearchCoinResult) => {
    setRecentCoins((currentCoins) => {
      const nextCoins = [coin, ...currentCoins.filter((item) => item.id !== coin.id)].slice(
        0,
        MAX_RECENT_COINS,
      );
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCoins));
      return nextCoins;
    });
  };

  return {
    recentCoins,
    saveRecentCoin,
  };
}
