import Link from "next/link";
import type { CurrentUserSnapshot } from "@/presentation/hooks/currentUserStore";
import { AppHeaderAuthControls } from "@/presentation/components/AppHeaderAuthControls";
import { cn } from "@/shared/lib/cn";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/characters", label: "캐릭터도감" },
] as const;

interface AppHeaderProps {
  currentPath: string;
  initialCurrentUserSnapshot?: CurrentUserSnapshot;
}

export function AppHeader({ currentPath, initialCurrentUserSnapshot }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link
          className="transition-opacity hover:opacity-80 focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-primary/30"
          href="/"
        >
          <div>
            <p className="font-display text-lg font-bold tracking-[-0.04em]">Ant Gravity</p>
            <p className="text-xs text-muted-foreground">코인 토론 메타게임 로그</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <nav aria-label="주요 네비게이션" className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = currentPath === item.href;

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

          <AppHeaderAuthControls initialCurrentUserSnapshot={initialCurrentUserSnapshot} />
        </div>
      </div>
    </header>
  );
}
