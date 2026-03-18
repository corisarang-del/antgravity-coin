"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCurrentUser } from "@/presentation/hooks/useCurrentUser";
import { useUserLevelStore } from "@/presentation/stores/userLevelStore";

export function AppHeader() {
  const { user, isLoading } = useCurrentUser();
  const { userLevel, hydrated, hydratedUserId, hydrateUserLevel } = useUserLevelStore();

  useEffect(() => {
    if (user?.userId && (!hydrated || hydratedUserId !== user.userId)) {
      hydrateUserLevel(user.userId);
    }
  }, [hydrateUserLevel, hydrated, hydratedUserId, user?.userId]);

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_10px_25px_rgba(17,29,61,0.18)]">
            AG
          </div>
          <div>
            <p className="font-display text-lg font-bold tracking-[-0.04em]">Ant Gravity</p>
            <p className="text-xs text-muted-foreground">코인 시즌 트레이더 배틀</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            aria-live="polite"
            className="rounded-full border border-border/80 bg-[hsl(var(--surface-2))] px-3 py-2 text-xs font-semibold text-muted-foreground shadow-[0_8px_24px_rgba(17,29,61,0.06)]"
          >
            내 레벨{" "}
            <span className="text-foreground">
              {isLoading ? "불러오는 중" : `${userLevel.title} Lv.${userLevel.level}`}
            </span>
          </div>
          <Link
            className="rounded-full border border-border/80 bg-card px-3 py-2 text-xs font-semibold transition-colors hover:border-primary/30 hover:bg-[hsl(var(--surface-2))] hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30"
            href="/characters"
          >
            캐릭터 도감
          </Link>
        </div>
      </div>
    </header>
  );
}
