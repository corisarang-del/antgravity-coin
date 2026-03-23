"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { UserBattle } from "@/domain/models/UserBattle";
import { storageKeys } from "@/shared/constants/storageKeys";

const USER_BATTLE_EVENT = "user-battle-change";
const USER_BATTLE_TTL_BY_TIMEFRAME = {
  "5m": 1000 * 60 * 90,
  "30m": 1000 * 60 * 60 * 3,
  "1h": 1000 * 60 * 60 * 4,
  "4h": 1000 * 60 * 60 * 12,
  "24h": 1000 * 60 * 60 * 36,
  "7d": 1000 * 60 * 60 * 24 * 10,
} as const;

function readUserBattleRaw() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(storageKeys.userBattle);
}

function subscribe(onStoreChange: () => void) {
  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener(USER_BATTLE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(USER_BATTLE_EVENT, handleChange);
  };
}

function clearUserBattle() {
  window.localStorage.removeItem(storageKeys.userBattle);
}

function isExpiredUserBattle(userBattle: UserBattle) {
  const selectedAt = Date.parse(userBattle.selectedAt);
  const ttl = USER_BATTLE_TTL_BY_TIMEFRAME[userBattle.timeframe];

  return !Number.isFinite(selectedAt) || !ttl || Date.now() - selectedAt > ttl;
}

export function useUserBattle(coinId?: string) {
  const rawValue = useSyncExternalStore(subscribe, readUserBattleRaw, () => null);

  const userBattle = useMemo(() => {
    if (!rawValue) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawValue) as UserBattle;

      if (coinId && parsed.coinId !== coinId) {
        clearUserBattle();
        return null;
      }

      if (isExpiredUserBattle(parsed)) {
        clearUserBattle();
        return null;
      }

      return parsed;
    } catch {
      clearUserBattle();
      return null;
    }
  }, [coinId, rawValue]);

  const saveUserBattle = (nextValue: UserBattle) => {
    window.localStorage.setItem(storageKeys.userBattle, JSON.stringify(nextValue));
    window.dispatchEvent(new Event(USER_BATTLE_EVENT));
  };

  return {
    userBattle,
    saveUserBattle,
  };
}
