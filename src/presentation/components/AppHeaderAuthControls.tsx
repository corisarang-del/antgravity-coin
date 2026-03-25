"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import type { CurrentUserSnapshot } from "@/presentation/hooks/currentUserStore";
import { refreshCurrentUserStore } from "@/presentation/hooks/currentUserStore";
import { useCurrentUser } from "@/presentation/hooks/useCurrentUser";
import { useUserLevelStore } from "@/presentation/stores/userLevelStore";

interface AppHeaderAuthControlsProps {
  initialCurrentUserSnapshot?: CurrentUserSnapshot;
}

export function AppHeaderAuthControls({
  initialCurrentUserSnapshot,
}: AppHeaderAuthControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { user, isLoading, isAuthenticated } = useCurrentUser(initialCurrentUserSnapshot);
  const userLevel = useUserLevelStore((state) => state.userLevel);
  const hydrated = useUserLevelStore((state) => state.hydrated);
  const hydratedUserId = useUserLevelStore((state) => state.hydratedUserId);
  const hydrateUserLevel = useUserLevelStore((state) => state.hydrateUserLevel);

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
    <>
      {isAuthenticated && user ? (
        <>
          <Link
            className="rounded-full border border-border/80 bg-card px-3 py-2 text-xs font-semibold transition hover:border-primary/30 hover:bg-[hsl(var(--surface-2))]"
            href="/me"
          >
            내페이지
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
          className="rounded-full border border-primary/20 bg-[hsl(var(--surface-2))] px-4 py-2 text-xs font-semibold text-foreground shadow-[0_8px_24px_rgba(17,29,61,0.06)] transition hover:border-primary/35 hover:bg-card hover:text-primary"
          href="/login"
        >
          로그인/회원가입
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
    </>
  );
}
