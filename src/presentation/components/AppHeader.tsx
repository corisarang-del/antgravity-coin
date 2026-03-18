"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useCurrentUser } from "@/presentation/hooks/useCurrentUser";
import { cn } from "@/shared/lib/cn";
import { useUserLevelStore } from "@/presentation/stores/userLevelStore";

const navItems = [
  { href: "/home", label: "홈" },
  { href: "/characters", label: "캐릭터 도감" },
] as const;

export function AppHeader() {
  const pathname = usePathname();
  const { user, isLoading } = useCurrentUser();
  const { userLevel, hydrated, hydratedUserId, hydrateUserLevel } = useUserLevelStore();

  useEffect(() => {
    if (user?.userId && (!hydrated || hydratedUserId !== user.userId)) {
      hydrateUserLevel(user.userId);
    }
  }, [hydrateUserLevel, hydrated, hydratedUserId, user?.userId]);

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link
          className="transition-opacity hover:opacity-80 focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-primary/30"
          href="/home"
        >
          <div>
            <p className="font-display text-lg font-bold tracking-[-0.04em]">Ant Gravity</p>
            <p className="text-xs text-muted-foreground">코인 시즌 트레이더 배틀</p>
          </div>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <nav aria-label="주요 네비게이션" className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-full border px-3 py-2 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary/30",
                    isActive
                      ? "border-primary/30 bg-[hsl(var(--surface-2))] text-foreground"
                      : "border-border/80 bg-card hover:border-primary/30 hover:bg-[hsl(var(--surface-2))] hover:text-primary",
                  )}
                  href={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div
            aria-live="polite"
            className="rounded-full border border-border/80 bg-[hsl(var(--surface-2))] px-3 py-2 text-xs font-semibold text-muted-foreground shadow-[0_8px_24px_rgba(17,29,61,0.06)]"
          >
            내 레벨{" "}
            <span className="text-foreground">
              {isLoading ? "불러오는 중" : `${userLevel.title} Lv.${userLevel.level}`}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
