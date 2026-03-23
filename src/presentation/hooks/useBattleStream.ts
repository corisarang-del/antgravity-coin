"use client";

import { startTransition, useEffect, useState } from "react";
import { createBattleTimingTracker, type BattleTimingMetrics } from "@/application/useCases/buildTimingMetrics";
import type { DebateMessage } from "@/domain/models/DebateMessage";
import type { MarketData } from "@/domain/models/MarketData";
import { emitBattleSnapshotChange } from "@/presentation/hooks/useBattleSnapshot";
import { storageKeys } from "@/shared/constants/storageKeys";

interface BattleSummary {
  headline: string;
  bias: string;
  indicators: Array<{
    label: string;
    value: string;
  }>;
}

interface UseBattleStreamOptions {
  coinId: string;
}

type IdleHandle = number;

function isAbortLikeError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  if (error instanceof Error) {
    return (
      error.name === "AbortError" ||
      error.message.includes("BodyStreamBuffer was aborted") ||
      error.message.includes("aborted")
    );
  }

  return false;
}

function scheduleBackgroundWrite(callback: () => void) {
  if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
    return window.requestIdleCallback(callback);
  }

  return window.setTimeout(callback, 0);
}

function cancelBackgroundWrite(handle: IdleHandle) {
  if (typeof window !== "undefined" && typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(handle);
    return;
  }

  window.clearTimeout(handle);
}

export function useBattleStream({ coinId }: UseBattleStreamOptions) {
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [summary, setSummary] = useState<BattleSummary | null>(null);
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null);
  const [isPickReady, setIsPickReady] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timingMetrics, setTimingMetrics] = useState<BattleTimingMetrics | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let cancelled = false;
    let currentMarketData: MarketData | null = null;
    let currentSummary: BattleSummary | null = null;
    let currentMessages: DebateMessage[] = [];
    let currentSnapshotId: string | null = null;
    let currentSavedToServerAt: string | null = null;
    let persistHandle: IdleHandle | null = null;
    const timingTracker = createBattleTimingTracker();

    const persistSnapshot = () => {
      if (persistHandle !== null) {
        cancelBackgroundWrite(persistHandle);
      }

      persistHandle = scheduleBackgroundWrite(() => {
        window.localStorage.setItem(
          storageKeys.battleSnapshot,
          JSON.stringify({
            version: 1,
            snapshotId: currentSnapshotId,
            coinId,
            marketData: currentMarketData,
            summary: currentSummary,
            messages: currentMessages,
            savedAt: new Date().toISOString(),
            savedToServerAt: currentSavedToServerAt,
          }),
        );
        emitBattleSnapshotChange();
        persistHandle = null;
      });
    };

    const persistSnapshotToServer = async () => {
      const snapshotId = currentSnapshotId ?? crypto.randomUUID();
      const response = await fetch("/api/battle/snapshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snapshotId,
          coinId,
          marketData: currentMarketData,
          summary: currentSummary,
          messages: currentMessages,
          savedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("battle_snapshot_persist_failed");
      }

      const payload = (await response.json()) as {
        snapshotId: string;
        userId?: string;
        battleId?: string | null;
        savedAt?: string;
      };
      currentSnapshotId = payload.snapshotId;
      currentSavedToServerAt = payload.savedAt ?? new Date().toISOString();
      persistSnapshot();
    };

    const persistTimingMetrics = () => {
      window.localStorage.setItem(
        storageKeys.battleTimingMetrics,
        JSON.stringify(timingTracker.getMetrics()),
      );
      setTimingMetrics(timingTracker.getMetrics());
    };

    setMessages([]);
    setMarketData(null);
    setSummary(null);
    setActiveCharacterId(null);
    setIsPickReady(false);
    setIsComplete(false);
    setError(null);

    async function run() {
      try {
        const response = await fetch("/api/battle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ coinId }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string; retryable?: boolean }
            | null;
          throw new Error(payload?.error ?? "배틀 데이터를 준비하지 못했어.");
        }

        if (!response.body) {
          throw new Error("스트림 응답이 비어 있다.");
        }

        timingTracker.markPreparedContext({
          preparedContextHit: response.headers.get("x-battle-prepared-context-hit") === "true",
          preparedFirstTurnHit: response.headers.get("x-battle-prepared-first-turn-hit") === "true",
          preparedAtAgeMs: response.headers.get("x-battle-prepared-at-age-ms")
            ? Number(response.headers.get("x-battle-prepared-at-age-ms"))
            : null,
        });
        persistTimingMetrics();

        reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!cancelled) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";

          for (const chunk of chunks) {
            const [eventLine, dataLine] = chunk.split("\n");
            const event = eventLine?.replace("event: ", "");
            const data = dataLine?.replace("data: ", "");

            if (!event || !data) {
              continue;
            }

            const parsed = JSON.parse(data) as
              | DebateMessage
              | { marketData: MarketData; summary: BattleSummary }
              | { characterId: string }
              | { completed: boolean }
              | { message: string };

            if (event === "battle_start") {
              const payload = parsed as { marketData: MarketData; summary: BattleSummary };
              currentMarketData = payload.marketData;
              currentSummary = payload.summary;
              timingTracker.markMarketDataReady();
              persistTimingMetrics();
              startTransition(() => {
                setMarketData(payload.marketData);
                setSummary(payload.summary);
              });
              continue;
            }

            if (event === "character_start") {
              timingTracker.markFirstCharacterStarted();
              persistTimingMetrics();
              startTransition(() => {
                setActiveCharacterId((parsed as { characterId: string }).characterId);
              });
              continue;
            }

            if (event === "message") {
              currentMessages = [...currentMessages, parsed as DebateMessage];
              timingTracker.markFirstMessageDisplayed();
              persistTimingMetrics();
              startTransition(() => {
                setMessages(currentMessages);
              });
              persistSnapshot();
              continue;
            }

            if (event === "character_done") {
              startTransition(() => {
                setActiveCharacterId(null);
              });
              continue;
            }

            if (event === "battle_complete") {
              timingTracker.markDebateCompleted();
              persistTimingMetrics();
              await persistSnapshotToServer().catch(() => undefined);
              startTransition(() => {
                setIsPickReady(true);
                setIsComplete((parsed as { completed: boolean }).completed);
              });
              continue;
            }

            if (event === "battle_pick_ready") {
              startTransition(() => {
                setIsPickReady(true);
              });
              continue;
            }

            if (event === "error") {
              startTransition(() => {
                setError((parsed as { message: string }).message);
              });
            }
          }
        }
      } catch (caughtError) {
        if (isAbortLikeError(caughtError)) {
          return;
        }

        setError(caughtError instanceof Error ? caughtError.message : "알 수 없는 오류가 발생했다.");
      }
    }

    void run();

    return () => {
      cancelled = true;
      if (persistHandle !== null) {
        cancelBackgroundWrite(persistHandle);
      }

      if (reader) {
        void reader.cancel().catch(() => undefined);
        return;
      }

      controller.abort();
    };
  }, [coinId]);

  return {
    messages,
    marketData,
    summary,
    activeCharacterId,
    isPickReady,
    isComplete,
    error,
    timingMetrics,
  };
}
