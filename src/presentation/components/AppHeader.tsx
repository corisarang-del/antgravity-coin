"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { refreshCurrentUserStore } from "@/presentation/hooks/currentUserStore";
import type { CurrentUserSnapshot } from "@/presentation/hooks/currentUserStore";
import { useCurrentUser } from "@/presentation/hooks/useCurrentUser";
import { useUserLevelStore } from "@/presentation/stores/userLevelStore";
import { cn } from "@/shared/lib/cn";

const navItems = [
  { href: "/home", label: "홈" },
  { href: "/characters", label: "캐릭터 도감" },
] as const;

interface AppHeaderProps {
  initialCurrentUserSnapshot?: CurrentUserSnapshot;
}

export function AppHeader({ initialCurrentUserSnapshot }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { user, isLoading, isAuthenticated } = useCurrentUser(initialCurrentUserSnapshot);
  const { userLevel, hydrated, hydratedUserId, hydrateUserLevel } = useUserLevelStore();

  useEffect(() => {
    if (user?.userId && (!hydrated || hydratedUserId !== user.userId)) {
      hydrateUserLevel(user.userId);
    }
  }, [hydrateUserLevel, hydrated, hydratedUserId, user?.userId]);

  const handleSignOut = () => {
    startTransition(() => {
      void fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      }).then(() => {
        refreshCurrentUserStore();
        router.push("/home");
        router.refresh();
      });
    });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link
          className="transition-opacity hover:opacity-80 focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-primary/30"
          href="/home"
        >
          <div>
            <p className="font-display text-lg font-bold tracking-[-0.04em]">Ant Gravity</p>
            <p className="text-xs text-muted-foreground">코인 토론 멀티배틀 로그</p>
          </div>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <nav aria-label="주요 내비게이션" className="flex items-center gap-2">
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

          {isAuthenticated && user ? (
            <>
              <Link
                className="rounded-full border border-border/80 bg-card px-3 py-2 text-xs font-semibold transition hover:border-primary/30 hover:bg-[hsl(var(--surface-2))]"
                href="/me"
              >
                내 페이지
              </Link>
              <button
                className="rounded-full border border-border/80 bg-card px-3 py-2 text-xs font-semibold transition hover:border-primary/30 hover:bg-[hsl(var(--surface-2))]"
                onClick={handleSignOut}
                type="button"
              >
                {isPending ? "로그아웃 중" : "로그아웃"}
              </button>
            </>
          ) : (
            <Link
              className="ag-primary-cta ag-primary-cta-text rounded-full px-4 transition hover:opacity-95"
              href="/login"
            >
              로그인
            </Link>
          )}

          <div
            aria-live="polite"
            className="ag-muted-pill rounded-full border border-border/80 bg-[hsl(var(--surface-2))] px-3 py-2 text-xs font-semibold shadow-[0_8px_24px_rgba(17,29,61,0.06)]"
          >
            계정 상태{" "}
            <span className="text-foreground">
              {isLoading
                ? "불러오는 중"
                : isAuthenticated && user
                  ? `${user.name} · ${userLevel.title} Lv.${userLevel.level}`
                  : "게스트"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
