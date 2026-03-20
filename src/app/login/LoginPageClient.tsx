"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/infrastructure/auth/supabaseBrowserClient";

const providerCards = [
  {
    provider: "google",
    label: "Google로 로그인",
    description: "구글 계정으로 배틀 기록과 레벨을 기기 간에 이어갈 수 있어.",
  },
  {
    provider: "kakao",
    label: "카카오로 로그인",
    description: "카카오 계정으로 로그인해서 내 배틀 기록을 안전하게 저장해.",
  },
] as const;

export function LoginPageClient() {
  const searchParams = useSearchParams();

  const handleSignIn = async (provider: "google" | "kakao") => {
    const supabase = createSupabaseBrowserClient();
    const next = searchParams.get("next") ?? "/me";

    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8">
        <section className="grid w-full gap-6 rounded-[32px] border border-border bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-6 shadow-[0_22px_50px_rgba(17,29,61,0.08)] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-border/80 bg-[hsl(var(--surface-2))] px-3 py-2 text-xs font-semibold text-muted-foreground">
              계정 연결
            </span>
            <div className="space-y-3">
              <h1 className="font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-none tracking-[-0.06em]">
                로그인해서
                <br />
                내 배틀 기록을 이어가
              </h1>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                지금 페이지 톤은 그대로 두고, 계정만 붙여서 배틀 기록과 레벨을 기기 간에 이어보는 흐름이야.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] border border-border/80 bg-[hsl(var(--surface-2))] p-4">
                <p className="text-xs font-semibold text-muted-foreground">저장되는 것</p>
                <p className="mt-2 text-sm font-semibold">배틀 기록</p>
              </div>
              <div className="rounded-[22px] border border-border/80 bg-[hsl(var(--surface-2))] p-4">
                <p className="text-xs font-semibold text-muted-foreground">같이 유지되는 것</p>
                <p className="mt-2 text-sm font-semibold">레벨과 XP</p>
              </div>
              <div className="rounded-[22px] border border-border/80 bg-[hsl(var(--surface-2))] p-4">
                <p className="text-xs font-semibold text-muted-foreground">복원 방식</p>
                <p className="mt-2 text-sm font-semibold">계정 기반</p>
              </div>
            </div>
            <Link
              className="inline-flex min-h-11 items-center rounded-[16px] border border-border/80 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-[hsl(var(--surface-2))] hover:text-foreground"
              href="/home"
            >
              홈으로 돌아가기
            </Link>
          </div>

          <div className="space-y-3 rounded-[28px] border border-border/80 bg-background/70 p-4">
            {providerCards.map((card) => (
              <button
                key={card.provider}
                className="w-full rounded-[22px] border border-border bg-card p-4 text-left shadow-[0_10px_22px_rgba(17,29,61,0.06)] transition hover:border-primary/30 hover:bg-[hsl(var(--surface-2))]"
                onClick={() => void handleSignIn(card.provider)}
                type="button"
              >
                <p className="text-sm font-semibold">{card.label}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</p>
              </button>
            ))}
            <div className="rounded-[22px] border border-border/80 bg-[hsl(var(--surface-2))] p-4 text-sm leading-6 text-muted-foreground">
              로그인하면 내 페이지에서 최근 배틀, 정산 결과, 레벨 상태를 한 번에 볼 수 있어.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
