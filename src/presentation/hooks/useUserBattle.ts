"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { UserBattle } from "@/domain/models/UserBattle";
import { storageKeys } from "@/shared/constants/storageKeys";

const USER_BATTLE_EVENT = "user-battle-change";

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

export function useUserBattle() {
  const rawValue = useSyncExternalStore(subscribe, readUserBattleRaw, () => null);

  const userBattle = useMemo(() => {
    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as UserBattle;
    } catch {
      return null;
    }
  }, [rawValue]);

  const saveUserBattle = (nextValue: UserBattle) => {
    window.localStorage.setItem(storageKeys.userBattle, JSON.stringify(nextValue));
    window.dispatchEvent(new Event(USER_BATTLE_EVENT));
  };

  return {
    userBattle,
    saveUserBattle,
  };
}
