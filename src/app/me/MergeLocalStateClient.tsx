"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/presentation/hooks/useCurrentUser";
import { storageKeys } from "@/shared/constants/storageKeys";

type MergeStatus =
  | { state: "idle" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

function readJson<T>(key: string) {
  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
}

export function MergeLocalStateClient() {
  const router = useRouter();
  const { user, guestUserId, isAuthenticated, isLoading } = useCurrentUser();
  const [mergeStatus, setMergeStatus] = useState<MergeStatus>(() => {
    if (typeof window === "undefined") {
      return { state: "idle" };
    }

    const notice = window.sessionStorage.getItem("auth-merge-notice");
    if (!notice) {
      return { state: "idle" };
    }

    window.sessionStorage.removeItem("auth-merge-notice");
    return { state: "success", message: notice };
  });

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user?.userId) {
      return;
    }

    const mergeKey = `auth-merge:${user.userId}`;
    if (window.localStorage.getItem(mergeKey) === "done") {
      return;
    }

    const recentCoins = readJson<string[]>(storageKeys.recentCoins) ?? [];
    const battleSnapshot = readJson(storageKeys.battleSnapshot);
    const userBattle = readJson(storageKeys.userBattle);
    const userLevel = guestUserId
      ? readJson(`${storageKeys.userLevel}:${guestUserId}`)
      : null;

    void fetch("/api/auth/merge-local", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        localUserLevel: userLevel,
        recentCoins,
        userBattle,
        battleSnapshot,
      }),
    })
      .then(async (response) => {
        const data = (await response.json().catch(() => null)) as
          | { importedBattleIds?: string[] }
          | null;

        if (!response.ok) {
          throw new Error("merge_failed");
        }

        window.localStorage.setItem(mergeKey, "done");
        const importedCount = data?.importedBattleIds?.length ?? 0;
        window.sessionStorage.setItem(
          "auth-merge-notice",
          importedCount > 0
            ? `기존 기록 ${importedCount}건을 계정에 연결했어.`
            : "현재 기기의 로컬 기록을 계정 상태와 동기화했어.",
        );
        router.refresh();
      })
      .catch(() => {
        setMergeStatus({
          state: "error",
          message: "기존 로컬 기록을 계정에 연결하지 못했어. 잠깐 뒤에 다시 새로고침해줘.",
        });
      });
  }, [guestUserId, isAuthenticated, isLoading, router, user?.userId]);

  if (mergeStatus.state === "idle") {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-4">
      <div
        aria-live="polite"
        className={`rounded-[20px] border px-4 py-3 text-sm shadow-[0_12px_24px_rgba(17,29,61,0.08)] ${
          mergeStatus.state === "success"
            ? "border-border/80 bg-[hsl(var(--surface-2))] text-foreground"
            : "border-bear/20 bg-bear/10 text-bear"
        }`}
      >
        {mergeStatus.message}
      </div>
    </div>
  );
}
