"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/infrastructure/auth/supabaseBrowserClient";

const providerCards = [
  {
    provider: "google",
    label: "Google로 계속하기",
    description: "처음이면 바로 가입되고, 이후엔 같은 계정으로 기록과 레벨을 이어가.",
    badge: "G",
    badgeClassName: "border-slate-300/80 bg-white text-slate-900",
  },
  {
    provider: "kakao",
    label: "카카오로 계속하기",
    description: "카카오 계정 하나로 배틀 기록, XP, 등급을 안전하게 이어갈 수 있어.",
    badge: "K",
    badgeClassName: "border-[#E3CE33] bg-[#FEE500] text-[#191600]",
  },
] as const;

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
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8">
        <section className="grid w-full gap-5 rounded-[36px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-4 shadow-[0_22px_50px_rgba(17,29,61,0.08)] lg:grid-cols-[1.08fr_0.92fr] lg:p-5">
          <div className="rounded-[30px] bg-[linear-gradient(145deg,hsl(var(--card))_0%,hsl(var(--surface-2))_100%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] sm:p-7">
            <div className="space-y-5">
              <span className="inline-flex rounded-full border border-border/80 bg-background/70 px-3 py-2 text-xs font-semibold text-muted-foreground">
                계정 라운지
              </span>
              <div className="space-y-3">
                <h1 className="font-display text-[clamp(2.7rem,7vw,5rem)] leading-[0.92] tracking-[-0.07em] text-foreground">
                  로그인도
                  <br />
                  회원가입도
                  <br />
                  한 번에
                </h1>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                  별도 가입 폼 없이 Google이나 카카오로 바로 들어오면 돼. 처음이면 계정이
                  만들어지고, 이후엔 같은 기록과 XP를 기기 간에 이어가게 된다.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-border/80 bg-background/72 p-4 shadow-[0_10px_24px_rgba(17,29,61,0.04)]">
                  <p className="text-xs font-semibold text-muted-foreground">가입 방식</p>
                  <p className="mt-2 font-display text-2xl font-bold tracking-[-0.05em]">원탭</p>
                  <p className="mt-1 text-xs text-muted-foreground">소셜 계정으로 바로 시작</p>
                </div>
                <div className="rounded-[24px] border border-border/80 bg-background/72 p-4 shadow-[0_10px_24px_rgba(17,29,61,0.04)]">
                  <p className="text-xs font-semibold text-muted-foreground">같이 유지되는 것</p>
                  <p className="mt-2 font-display text-2xl font-bold tracking-[-0.05em] text-xp">
                    XP
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">등급과 전적도 함께 누적</p>
                </div>
                <div className="rounded-[24px] border border-border/80 bg-background/72 p-4 shadow-[0_10px_24px_rgba(17,29,61,0.04)]">
                  <p className="text-xs font-semibold text-muted-foreground">로그인 후</p>
                  <p className="mt-2 font-display text-2xl font-bold tracking-[-0.05em]">/me</p>
                  <p className="mt-1 text-xs text-muted-foreground">내 상태부터 바로 확인</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  className="inline-flex min-h-11 items-center rounded-full border border-border/80 bg-background/70 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-card"
                  href="/home"
                >
                  홈으로 돌아가기
                </Link>
                <span className="rounded-full border border-border/70 bg-background/60 px-3 py-2 text-xs font-semibold text-muted-foreground">
                  배틀 기록, XP, 등급을 계정 기준으로 이어감
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-border/80 bg-background/75 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.38)] sm:p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="inline-flex rounded-full border border-border/80 bg-[hsl(var(--surface-2))] px-3 py-2 text-xs font-semibold text-muted-foreground">
                  로그인 또는 회원가입
                </span>
                <h2 className="font-display text-3xl font-bold tracking-[-0.05em]">
                  원하는 계정으로
                  <br />
                  바로 연결해
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  지금은 소셜 로그인만 열어두고, 첫 로그인도 회원가입으로 자연스럽게 처리하는 흐름이야.
                </p>
              </div>

              {error === "oauth_callback_failed" ? (
                <div className="rounded-[22px] border border-bear/20 bg-[linear-gradient(180deg,hsl(var(--surface-2))_0%,hsl(var(--card))_100%)] p-4 text-sm leading-6 text-foreground">
                  로그인 연결이 중간에 끊겼어. 같은 버튼으로 다시 한 번 시도해줘.
                </div>
              ) : null}

              <div className="space-y-3">
                {providerCards.map((card) => (
                  <button
                    key={card.provider}
                    className="w-full rounded-[26px] border border-border/80 bg-card p-4 text-left text-foreground shadow-[0_12px_28px_rgba(17,29,61,0.06)] transition hover:border-primary/25 hover:bg-[hsl(var(--surface-2))]"
                    disabled={isPending}
                    onClick={() => void handleSignIn(card.provider)}
                    type="button"
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${card.badgeClassName}`}
                      >
                        {card.badge}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold">
                            {isPending && pendingProvider === card.provider ? "연결 중..." : card.label}
                          </p>
                          <span className="rounded-full bg-[hsl(var(--surface-2))] px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                            원탭
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-[24px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--surface-2))_0%,hsl(var(--card))_100%)] p-4">
                <p className="text-xs font-semibold text-muted-foreground">로그인 후 바로 보이는 것</p>
                <div className="mt-3 grid gap-2 text-sm text-foreground">
                  <p>프로필과 연결 계정</p>
                  <p>누적 XP와 현재 등급</p>
                  <p>최근 배틀 기록과 승패 흐름</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
