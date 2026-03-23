import Link from "next/link";
import { LandingCharacterRail } from "@/app/LandingCharacterRail";
import { LandingEnterOverlay } from "@/app/LandingEnterOverlay";

const landingRows = [
  {
    title: "오늘의 추천 주제",
    items: ["BTC 강세 시그널", "ETH 온체인 체크", "SOL 모멘텀 체인", "XRP 리스크 브리핑"],
  },
  {
    title: "지금 보는 지표",
    items: ["공포탐욕 시그널", "롱숏 과열 경고", "고래 자금 흐름", "커뮤니티 온도"],
  },
] as const;

export default function LandingPage() {
  return (
    <>
      <LandingEnterOverlay />
      <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
        <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <div>
              <p className="font-display text-2xl font-bold tracking-[-0.06em] text-primary">Ant Gravity</p>
              <p className="text-xs text-muted-foreground">코인 시즌 트레이더 배틀</p>
            </div>
            <Link
              className="ag-primary-cta ag-primary-cta-text inline-flex min-h-11 items-center rounded-full px-5 py-3 text-sm font-semibold"
              href="/home"
            >
              배틀 입장
            </Link>
          </div>
        </header>

        <main className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-6">
          <section className="relative overflow-hidden rounded-[36px] border border-border bg-[linear-gradient(135deg,hsl(var(--landing-hero-ink))_0%,hsl(var(--landing-hero-deep))_48%,hsl(var(--landing-hero-blush))_100%)] px-6 py-8 text-white md:px-10 md:py-12">
            <div className="absolute inset-y-0 right-[-8%] hidden w-[46%] rotate-[-6deg] rounded-[40px] border border-white/20 bg-[linear-gradient(180deg,hsla(var(--landing-card-rose),0.95),hsla(var(--landing-card-butter),0.95))] p-6 shadow-[0_40px_80px_rgba(10,16,38,0.32)] lg:block">
              <div className="grid gap-4">
                <div className="rounded-[26px] border border-[hsl(var(--landing-line))] bg-[hsl(var(--landing-card-cream))] p-5 text-[hsl(var(--primary))]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">실시간 배틀</p>
                  <p className="mt-3 font-display text-3xl font-bold tracking-[-0.05em]">Bull vs Bear</p>
                  <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                    8명의 캐릭터가 같은 코인을 각자 다른 관점으로 분석해.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-[24px] bg-[hsl(var(--landing-card-cream))] p-4 text-[hsl(var(--primary))]">
                    <p className="text-xs font-semibold">지금 보는 신호</p>
                    <p className="mt-2 font-display text-2xl font-bold">공포탐욕</p>
                  </div>
                  <div className="rounded-[24px] bg-[hsl(var(--landing-card-butter))] p-4 text-[hsl(var(--primary))]">
                    <p className="text-xs font-semibold">성장 루프</p>
                    <p className="mt-2 font-display text-2xl font-bold">레벨 업</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                ANT GRAVITY
              </span>
              <h1 className="mt-5 max-w-3xl text-[clamp(2.85rem,9.5vw,6.65rem)] font-black tracking-[-0.06em]">
                <span className="block leading-[0.92] md:leading-[0.9]">코인분석을</span>
                <span className="block pt-2 leading-[0.92] tracking-[-0.06em] md:pt-3 md:leading-[0.9]">
                  캐릭터토론으로
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/90 md:text-base">
                AI 트레이더들이 같은 코인을 두고 정면승부를 펼쳐.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  className="ag-light-cta ag-light-cta-text rounded-full px-6"
                  href="/home"
                >
                  바로 배틀 시작
                </Link>
                <Link
                  className="inline-flex min-h-12 items-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white"
                  href="/characters"
                >
                  트레이더 먼저 보기
                </Link>
              </div>
            </div>
          </section>

          <LandingCharacterRail />

          {landingRows.map((row) => (
            <section key={row.title} className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="font-display text-3xl font-bold tracking-[-0.05em]">{row.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    메인 진입 전 바로 감이 오는 카드 라인업이야.
                  </p>
                </div>
                <Link className="text-sm font-semibold text-primary" href="/home">
                  전체 보기
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                {row.items.map((item, index) => (
                  <article
                    key={item}
                    className={`group min-h-48 rounded-[28px] border border-[hsl(var(--landing-line))] p-5 shadow-[0_24px_50px_rgba(20,32,68,0.08)] transition-transform duration-300 hover:-translate-y-2 hover:scale-[1.02] ${index % 3 === 0 ? "bg-[hsl(var(--landing-card-rose))]" : index % 3 === 1 ? "bg-[hsl(var(--landing-card-cream))]" : "bg-[hsl(var(--landing-card-butter))]"}`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">지금 보는 카드</p>
                    <p className="mt-4 font-display text-3xl font-bold tracking-[-0.05em] text-primary">
                      {item}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      들어오자마자 지금 분위기를 바로 읽을 수 있게 묶어뒀어.
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-[36px] border border-border bg-card px-6 py-8 md:px-10">
            <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  바로 시작해도 좋아
                </p>
                <h2 className="mt-3 font-display text-4xl font-bold tracking-[-0.06em] text-primary">
                  첫인상은 강하게
                  <br />
                  플레이는 부드럽게
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  className="ag-primary-cta ag-primary-cta-text inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
                  href="/home"
                >
                  지금 배틀 시작하기
                </Link>
                <p className="text-sm text-muted-foreground">당신을 기다리는 개미 트레이더 8인</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
