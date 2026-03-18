"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { DebateMessage } from "@/domain/models/DebateMessage";
import type { MarketData } from "@/domain/models/MarketData";
import { storageKeys } from "@/shared/constants/storageKeys";

const BATTLE_SNAPSHOT_EVENT = "battle-snapshot-change";

export interface BattleSnapshot {
  version: 1;
  coinId: string;
  marketData: MarketData | null;
  summary: {
    headline: string;
    bias: string;
    indicators: Array<{
      label: string;
      value: string;
    }>;
  } | null;
  messages: DebateMessage[];
  savedAt?: string;
}

function readBattleSnapshotRaw() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(storageKeys.battleSnapshot);
}

function subscribe(onStoreChange: () => void) {
  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener(BATTLE_SNAPSHOT_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(BATTLE_SNAPSHOT_EVENT, handleChange);
  };
}

export function emitBattleSnapshotChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(BATTLE_SNAPSHOT_EVENT));
  }
}

export function useBattleSnapshot() {
  const rawValue = useSyncExternalStore(subscribe, readBattleSnapshotRaw, () => null);

  return useMemo(() => {
    if (!rawValue) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawValue) as Partial<BattleSnapshot>;
      if (parsed.version !== 1) {
        return null;
      }

      return parsed as BattleSnapshot;
    } catch {
      return null;
    }
  }, [rawValue]);
}
