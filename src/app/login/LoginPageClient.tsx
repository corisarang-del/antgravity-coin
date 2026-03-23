"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/infrastructure/auth/supabaseBrowserClient";

const providerCards = [
  {
    provider: "google",
    label: "Google로 시작",
    badge: "G",
    badgeClassName: "border-slate-300/80 bg-white text-slate-900",
  },
  {
    provider: "kakao",
    label: "Kakao로 시작",
    badge: "K",
    badgeClassName: "border-[#E3CE33] bg-[#FEE500] text-[#191600]",
  },
] as const;

const benefitPills = ["빠른 시작", "기록 유지", "바로 /me"] as const;

export function LoginPageClient() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isPending, startTransition] = useTransition();
  const [pendingProvider, setPendingProvider] = useState<"google" | "kakao" | null>(null);

  const handleSignIn = async (provider: "google" | "kakao") => {
    const supabase = createSupabaseBrowserClient();
    const next = searchParams.get("next") ?? "/me";

    setPendingProvider(provider);
    startTransition(() => {
      void supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-4 py-8">
        <section className="grid w-full gap-4 rounded-[32px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-4 shadow-[0_22px_50px_rgba(17,29,61,0.08)] lg:grid-cols-[1.05fr_0.95fr] lg:p-5">
          <div className="flex rounded-[28px] bg-[linear-gradient(145deg,hsl(var(--card))_0%,hsl(var(--surface-2))_100%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] sm:p-7">
            <div className="flex w-full flex-col justify-between gap-8">
              <div className="space-y-5">
                <span className="inline-flex rounded-full border border-border/80 bg-background/72 px-3 py-2 text-xs font-semibold text-muted-foreground">
                  계정 연결
                </span>
                <div className="space-y-3">
                  <h1 className="max-w-[6ch] font-display text-[clamp(2.35rem,6vw,3.9rem)] leading-[0.94] tracking-[-0.06em] text-foreground">
                    바로시작
                  </h1>
                  <p className="ag-body-copy ag-body-copy-strong max-w-md">
                    Google이나 Kakao로 바로 들어와. 배틀 기록과 XP는 그대로 이어져.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {benefitPills.map((pill) => (
                    <span
                      key={pill}
                      className="rounded-full border border-border/75 bg-background/70 px-3 py-2 text-xs font-semibold text-foreground/78"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  className="inline-flex min-h-11 items-center rounded-full border border-border/80 bg-background/72 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-card"
                  href="/home"
                >
                  홈으로 돌아가기
                </Link>
                <p className="text-xs font-medium text-muted-foreground">
                  처음 로그인해도 바로 시작돼.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-border/80 bg-background/78 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.38)] sm:p-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <span className="inline-flex rounded-full border border-border/80 bg-[hsl(var(--surface-2))] px-3 py-2 text-xs font-semibold text-muted-foreground">
                  바로 시작
                </span>
                <h2 className="font-display text-[2rem] font-bold tracking-[-0.05em] text-foreground">
                  계속할 방식만
                  <br />
                  고르면 돼
                </h2>
              </div>

              {error === "oauth_callback_failed" ? (
                <div className="ag-body-copy rounded-[22px] border border-bear/20 bg-[linear-gradient(180deg,hsl(var(--surface-2))_0%,hsl(var(--card))_100%)] p-4 text-foreground">
                  로그인 연결이 끊겼어. 같은 버튼으로 다시 시도해줘.
                </div>
              ) : null}

              <div className="space-y-3">
                {providerCards.map((card) => (
                  <button
                    key={card.provider}
                    className="w-full rounded-[24px] border border-border/80 bg-card px-4 py-4 text-left text-foreground shadow-[0_12px_28px_rgba(17,29,61,0.06)] transition hover:border-primary/25 hover:bg-[hsl(var(--surface-2))]"
                    disabled={isPending}
                    onClick={() => void handleSignIn(card.provider)}
                    type="button"
                  >
                    <div className="flex min-h-11 items-center gap-4">
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${card.badgeClassName}`}
                      >
                        {card.badge}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {isPending && pendingProvider === card.provider ? "연결 중..." : card.label}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-[22px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--surface-2))_0%,hsl(var(--card))_100%)] px-4 py-3">
                <p className="text-sm font-semibold text-foreground">로그인 후 바로 보이는 것</p>
                <p className="ag-body-copy ag-body-copy-strong mt-1">내 XP, 등급, 최근 배틀 기록.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
