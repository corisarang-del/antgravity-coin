"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { useRouter } from "next/navigation";
import { CharacterImage } from "@/presentation/components/CharacterImage";
import { characters } from "@/shared/constants/characters";
import { cn } from "@/shared/lib/cn";
import { PreviewVideoCache, type PreviewVideoStatus } from "@/app/previewVideoCache";

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

type PreviewCharacter = (typeof characters)[number];

interface HoverPreviewState {
  character: PreviewCharacter;
  rect: DOMRect;
}

function toneClass(tone: PreviewCharacter["accentTone"]) {
  if (tone === "rose") {
    return "bg-[hsl(var(--landing-card-rose))]";
  }

  if (tone === "butter") {
    return "bg-[hsl(var(--landing-card-butter))]";
  }

  return "bg-[hsl(var(--landing-card-cream))]";
}

function getPreviewVideoSrc(character: PreviewCharacter) {
  return `/characters/previews/${character.id}.mp4`;
}

function getPreviewAspectRatioClass() {
  return "aspect-[20/11]";
}

function CharacterPreviewMedia({
  character,
  className,
}: {
  character: PreviewCharacter;
  className?: string;
}) {
  return (
    <CharacterImage
      alt={character.name}
      className={cn("h-full w-full object-contain object-center", className)}
      src={character.imageSrc}
    />
  );
}

function CharacterHoverPreview({
  preview,
  isVisible,
  previewVideoCache,
  audioEnabled,
  activeAudioVideoRef,
  lastAudioCharacterIdRef,
  lastAudioStartedAtRef,
  onMouseEnter,
  onMouseLeave,
}: {
  preview: HoverPreviewState;
  isVisible: boolean;
  previewVideoCache: PreviewVideoCache;
  audioEnabled: boolean;
  activeAudioVideoRef: MutableRefObject<HTMLVideoElement | null>;
  lastAudioCharacterIdRef: MutableRefObject<string | null>;
  lastAudioStartedAtRef: MutableRefObject<number>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const previewWidth = Math.min(420, window.innerWidth - 48);
  const left = Math.min(
    Math.max(preview.rect.left + preview.rect.width / 2 - previewWidth / 2, 24),
    window.innerWidth - previewWidth - 24,
  );
  const top = Math.max(preview.rect.top - 24, 24);
  const previewVideoSrc = getPreviewVideoSrc(preview.character);
  const [videoStatus, setVideoStatus] = useState<PreviewVideoStatus>(() =>
    previewVideoCache.get(preview.character.id)?.status ?? "loading",
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const entry = previewVideoCache.preload(preview.character.id, previewVideoSrc);

    if (entry.status === "loading") {
      void entry.promise
        .then(() => {
          if (isMounted) {
            setVideoStatus("ready");
          }
        })
        .catch(() => {
          if (isMounted) {
            setVideoStatus("error");
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [preview.character.id, previewVideoCache, previewVideoSrc]);

  useEffect(() => {
    if (!isVisible || videoStatus !== "ready" || !videoRef.current) {
      return;
    }

    const video = videoRef.current;
    const isSameCharacterReplay = preview.character.id === lastAudioCharacterIdRef.current;
    const shouldRestartAudio =
      audioEnabled &&
      (!isSameCharacterReplay || Date.now() - lastAudioStartedAtRef.current >= 2000);

    const previousVideo = activeAudioVideoRef.current;

    if (previousVideo && previousVideo !== video) {
      previousVideo.pause();
      previousVideo.currentTime = 0;
      previousVideo.muted = true;
    }

    activeAudioVideoRef.current = video;
    video.pause();
    if (shouldRestartAudio) {
      video.currentTime = 0;
    }
    video.volume = 1;
    video.muted = !shouldRestartAudio;

    void video.play()
      .then(() => {
        if (shouldRestartAudio) {
          lastAudioCharacterIdRef.current = preview.character.id;
          lastAudioStartedAtRef.current = Date.now();
        }
      })
      .catch(() => {
        video.muted = true;
        void video.play().catch(() => undefined);
      });

    return () => {
      video.pause();
      if (activeAudioVideoRef.current === video) {
        activeAudioVideoRef.current = null;
      }
    };
  }, [
    activeAudioVideoRef,
    audioEnabled,
    isVisible,
    lastAudioCharacterIdRef,
    lastAudioStartedAtRef,
    preview.character.id,
    videoStatus,
  ]);

  return (
    <div
      className={cn(
        "fixed z-40 overflow-hidden rounded-[28px] border border-white/20 bg-[hsl(var(--landing-hero-ink))] text-white shadow-[0_36px_80px_rgba(0,0,0,0.45)] transition-opacity duration-150",
        isVisible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ left, top, width: previewWidth }}
    >
      <div className="overflow-hidden rounded-t-[28px]">
        <div
          className={cn(
            "relative bg-[linear-gradient(135deg,hsl(var(--landing-hero-ink))_0%,hsl(var(--landing-hero-deep))_100%)]",
            getPreviewAspectRatioClass(),
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,rgba(8,12,28,0.12)_42%,rgba(8,12,28,0.52)_100%)]" />
          <div className={cn("absolute inset-0", videoStatus === "ready" ? "hidden" : "block")}>
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <CharacterPreviewMedia character={preview.character} className="h-full w-full" />
            </div>
          </div>
          {videoStatus === "ready" ? (
            <video
              ref={videoRef}
              autoPlay
              className="relative z-10 h-full w-full object-cover object-center"
              playsInline
              poster={preview.character.posterSrc}
              preload="auto"
              src={previewVideoSrc}
            />
          ) : null}
        </div>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-white/75">
          <span className="rounded border border-white/20 px-2 py-1 text-xs">character preview</span>
          <span>{preview.character.team === "bull" ? "불리시" : "베어리시"}</span>
          <span>·</span>
          <span>{preview.character.role}</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-white/78">{preview.character.specialty}</p>
      </div>
    </div>
  );
}

function CharacterPreviewModal({
  character,
  onClose,
}: {
  character: PreviewCharacter;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[84rem] overflow-hidden rounded-[32px] border border-white/20 bg-[hsl(var(--landing-hero-ink))] text-white shadow-[0_40px_100px_rgba(0,0,0,0.45)]">
        <button
          aria-label="닫기"
          className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white"
          onClick={onClose}
          type="button"
        >
          닫기
        </button>
        <div className="grid min-h-[34rem] md:grid-cols-[1.25fr_0.75fr]">
          <div className="relative min-h-[24rem] bg-black/10 p-6">
            <CharacterPreviewMedia key={character.id} character={character} />
          </div>
          <div className="flex flex-col justify-end gap-4 p-6 md:p-8">
            <span className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
              Character Preview
            </span>
            <h3 className="font-display text-5xl font-bold tracking-[-0.06em]">{character.name}</h3>
            <p className="text-sm font-semibold text-white/78">{character.role}</p>
            <p className="text-sm leading-7 text-white/74">{character.specialty}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                className="inline-flex min-h-12 items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[hsl(var(--landing-hero-ink))]"
                href="/home"
              >
                홈으로 이동
              </Link>
              <Link
                className="inline-flex min-h-12 items-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white"
                href="/characters"
              >
                도감 전체 보기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CharacterPosterCard({
  character,
  onOpen,
  onHoverStart,
  onHoverEnd,
  onPreload,
  onUnlockAudio,
}: {
  character: PreviewCharacter;
  onOpen: (character: PreviewCharacter) => void;
  onHoverStart: (character: PreviewCharacter, rect: DOMRect) => void;
  onHoverEnd: () => void;
  onPreload: (character: PreviewCharacter) => void;
  onUnlockAudio: () => void;
}) {
  return (
    <button
      className="group relative w-[12.5rem] shrink-0 snap-start text-left transition-transform duration-300 hover:z-20 hover:scale-[1.08] focus-visible:z-20 focus-visible:scale-[1.08]"
      onClick={() => onOpen(character)}
      onFocus={() => onPreload(character)}
      onMouseEnter={(event) => onHoverStart(character, event.currentTarget.getBoundingClientRect())}
      onMouseLeave={onHoverEnd}
      onPointerDown={() => {
        onUnlockAudio();
        onPreload(character);
      }}
      onPointerEnter={() => onPreload(character)}
      type="button"
    >
      <div className="overflow-hidden rounded-[24px] border border-[hsl(var(--landing-line))] shadow-[0_24px_60px_rgba(10,16,38,0.18)]">
        <div className="relative aspect-square overflow-hidden bg-[linear-gradient(180deg,rgba(8,12,28,0.04),rgba(8,12,28,0.18))]">
          <div
            className={cn(
              "absolute inset-y-3 left-1/2 w-[78%] -translate-x-1/2 rounded-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
              toneClass(character.accentTone),
            )}
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(6,10,24,0.88))]" />
          <div className="relative z-10 flex h-full items-end justify-center px-0 pt-1">
            <CharacterImage
              alt={character.name}
              className="h-[104%] w-auto max-w-none object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.05]"
              src={character.posterSrc}
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 z-20 bg-[linear-gradient(180deg,transparent,rgba(6,10,24,0.88))] p-4 text-white">
            <p className="font-display text-2xl font-bold tracking-[-0.05em]">{character.name}</p>
            <p className="mt-1 text-xs text-white/70">{character.role}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

function CharacterSlider({
  onOpen,
  onHoverStart,
  onHoverEnd,
  onPreload,
  onUnlockAudio,
}: {
  onOpen: (character: PreviewCharacter) => void;
  onHoverStart: (character: PreviewCharacter, rect: DOMRect) => void;
  onHoverEnd: () => void;
  onPreload: (character: PreviewCharacter) => void;
  onUnlockAudio: () => void;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollByPage = (direction: "prev" | "next") => {
    if (!railRef.current) {
      return;
    }

    const amount = railRef.current.clientWidth * 0.92;
    railRef.current.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-[-0.05em]">트레이더 시즌1 라인업</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="이전"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold text-primary transition hover:border-primary"
            onClick={() => scrollByPage("prev")}
            type="button"
          >
            ←
          </button>
          <button
            aria-label="다음"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold text-primary transition hover:border-primary"
            onClick={() => scrollByPage("next")}
            type="button"
          >
            →
          </button>
        </div>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-[linear-gradient(90deg,hsl(var(--background)),transparent)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-[linear-gradient(270deg,hsl(var(--background)),transparent)]" />
        <div
          ref={railRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {characters.map((character) => (
            <CharacterPosterCard
              key={character.id}
              character={character}
              onHoverEnd={onHoverEnd}
              onHoverStart={onHoverStart}
              onOpen={onOpen}
              onPreload={onPreload}
              onUnlockAudio={onUnlockAudio}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingPageClient() {
  const router = useRouter();
  const hoverTimeoutRef = useRef<number | null>(null);
  const activeAudioVideoRef = useRef<HTMLVideoElement | null>(null);
  const unlockVideoRef = useRef<HTMLVideoElement | null>(null);
  const lastAudioCharacterIdRef = useRef<string | null>(null);
  const lastAudioStartedAtRef = useRef(0);
  const [previewVideoCache] = useState(() => new PreviewVideoCache());
  const [selectedCharacter, setSelectedCharacter] = useState<PreviewCharacter | null>(null);
  const [hoveredPreview, setHoveredPreview] = useState<HoverPreviewState | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [hasUnlockedAudio, setHasUnlockedAudio] = useState(false);
  const [audioPreference, setAudioPreference] = useState<"auto" | "off">("auto");

  const audioEnabled = hasUnlockedAudio && audioPreference !== "off";

  const attemptAudioUnlock = async () => {
    if (hasUnlockedAudio || !unlockVideoRef.current) {
      return;
    }

    const video = unlockVideoRef.current;

    try {
      video.currentTime = 0;
      video.muted = false;
      video.volume = 0.01;
      await video.play();
      window.setTimeout(() => {
        video.pause();
        video.currentTime = 0;
        video.volume = 1;
      }, 120);
      setHasUnlockedAudio(true);
    } catch {
      video.pause();
      video.currentTime = 0;
      video.muted = true;
    }
  };

  const navigateToHome = () => {
    setIsTransitioning(true);
    window.setTimeout(() => {
      router.push("/home");
    }, 650);
  };

  const preloadCharacterPreview = (character: PreviewCharacter) => {
    void previewVideoCache
      .preload(character.id, getPreviewVideoSrc(character))
      .promise.catch(() => undefined);
  };

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    const clearHoverPreview = () => {
      clearHoverTimeout();
      setIsPreviewVisible(false);
    };

    window.addEventListener("scroll", clearHoverPreview, { passive: true });
    window.addEventListener("resize", clearHoverPreview);

    return () => {
      window.removeEventListener("scroll", clearHoverPreview);
      window.removeEventListener("resize", clearHoverPreview);
    };
  }, []);

  const handleEnterExperience = () => {
    setAudioPreference("auto");
    setHasEntered(true);
    void attemptAudioUnlock();
  };

  const handleHoverStart = (character: PreviewCharacter, rect: DOMRect) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    preloadCharacterPreview(character);
    clearHoverTimeout();
    setHoveredPreview({ character, rect });
    setIsPreviewVisible(true);
  };

  const handleHoverEnd = () => {
    clearHoverTimeout();
    hoverTimeoutRef.current = window.setTimeout(() => {
      setIsPreviewVisible(false);
    }, 120);
  };

  if (!hasEntered) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,hsl(var(--landing-hero-ink))_0%,hsl(var(--landing-hero-deep))_55%,hsl(var(--landing-hero-blush))_100%)] px-4 text-white">
        <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center text-center">
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
            ANT GRAVITY
          </span>
          <h1 className="mt-6 font-display text-[clamp(2.4rem,9vw,5rem)] font-black tracking-[-0.06em]">
            코인 트레이더 배틀에
            <br />
            오신걸 환영합니다
          </h1>
          <button
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-[hsl(var(--landing-hero-ink))] shadow-[0_18px_36px_rgba(0,0,0,0.2)]"
            onClick={handleEnterExperience}
            type="button"
          >
            입장
          </button>
          <video
            ref={unlockVideoRef}
            className="hidden"
            playsInline
            preload="auto"
            src={getPreviewVideoSrc(characters[4])}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-[60] bg-[linear-gradient(135deg,hsl(var(--landing-hero-ink))_0%,hsl(var(--landing-hero-deep))_55%,hsl(var(--landing-hero-blush))_100%)] opacity-0 transition duration-500",
          isTransitioning && "opacity-100",
        )}
      >
        <div className="flex h-full items-center justify-center">
          <p className="font-display text-[clamp(2.5rem,8vw,5rem)] font-black tracking-[-0.08em] text-white">
            ENTERING HOME
          </p>
        </div>
      </div>

      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <p className="font-display text-2xl font-bold tracking-[-0.06em] text-primary">Ant Gravity</p>
            <p className="text-xs text-muted-foreground">코인 시즌 트레이더 배틀</p>
          </div>
          <button
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            onClick={navigateToHome}
            type="button"
          >
            배틀 입장
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-6">
        <section className="relative overflow-hidden rounded-[36px] border border-border bg-[linear-gradient(135deg,hsl(var(--landing-hero-ink))_0%,hsl(var(--landing-hero-deep))_48%,hsl(var(--landing-hero-blush))_100%)] px-6 py-8 text-white md:px-10 md:py-12">
          <div className="absolute inset-y-0 right-[-8%] hidden w-[46%] rotate-[-6deg] rounded-[40px] border border-white/20 bg-[linear-gradient(180deg,hsla(var(--landing-card-rose),0.95),hsla(var(--landing-card-butter),0.95))] p-6 shadow-[0_40px_80px_rgba(10,16,38,0.32)] lg:block">
            <div className="grid gap-4">
              <div className="rounded-[26px] border border-[hsl(var(--landing-line))] bg-[hsl(var(--landing-card-cream))] p-5 text-[hsl(var(--primary))]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">LIVE PANEL</p>
                <p className="mt-3 font-display text-3xl font-bold tracking-[-0.05em]">Bull vs Bear</p>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                  8명의 캐릭터가 같은 코인을 각자 다른 관점으로 분석해.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[24px] bg-[hsl(var(--landing-card-cream))] p-4 text-[hsl(var(--primary))]">
                  <p className="text-xs font-semibold">SIGNAL</p>
                  <p className="mt-2 font-display text-2xl font-bold">Fear & Greed</p>
                </div>
                <div className="rounded-[24px] bg-[hsl(var(--landing-card-butter))] p-4 text-[hsl(var(--primary))]">
                  <p className="text-xs font-semibold">XP LOOP</p>
                  <p className="mt-2 font-display text-2xl font-bold">Level Up</p>
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
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/76 md:text-base">
              AI 에이전트 트레이더끼리의 분석배틀 시작
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                className="inline-flex min-h-12 items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[hsl(var(--landing-hero-ink))]"
                onClick={navigateToHome}
                type="button"
              >
                바로 배틀 시작
              </button>
              <Link
                className="inline-flex min-h-12 items-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white"
                href="/characters"
              >
                트레이더 먼저 보기
              </Link>
            </div>
          </div>
        </section>

        <CharacterSlider
          onHoverEnd={handleHoverEnd}
          onHoverStart={handleHoverStart}
          onOpen={setSelectedCharacter}
          onPreload={preloadCharacterPreview}
          onUnlockAudio={() => {
            void attemptAudioUnlock();
          }}
        />

        {landingRows.map((row) => (
          <section key={row.title} className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-display text-3xl font-bold tracking-[-0.05em]">{row.title}</h2>
                <p className="text-sm text-muted-foreground">
                  메인 진입 전 바로 감이 오는 카드 라인업이야.
                </p>
              </div>
              <button
                className="text-sm font-semibold text-primary"
                onClick={navigateToHome}
                type="button"
              >
                전체 보기
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {row.items.map((item, index) => (
                <article
                  key={item}
                  className={`group min-h-48 rounded-[28px] border border-[hsl(var(--landing-line))] p-5 shadow-[0_24px_50px_rgba(20,32,68,0.08)] transition-transform duration-300 hover:-translate-y-2 hover:scale-[1.02] ${index % 3 === 0 ? "bg-[hsl(var(--landing-card-rose))]" : index % 3 === 1 ? "bg-[hsl(var(--landing-card-cream))]" : "bg-[hsl(var(--landing-card-butter))]"}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">Featured</p>
                  <p className="mt-4 font-display text-3xl font-bold tracking-[-0.05em] text-primary">
                    {item}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    캐릭터와 지표 카드가 같이 들어와 메인 진입 전에 톤을 보여줘.
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
                Ready to Play
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-[-0.06em] text-primary">
                첫인상은 강하게
                <br />
                플레이는 부드럽게
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              <button
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                onClick={navigateToHome}
                type="button"
              >
                지금 배틀 시작하기
              </button>
              <p className="text-sm text-muted-foreground">당신을 기다리는 개미 트레이더 8인</p>
            </div>
          </div>
        </section>
      </main>

      {hoveredPreview ? (
        <CharacterHoverPreview
          activeAudioVideoRef={activeAudioVideoRef}
          audioEnabled={audioEnabled}
          isVisible={isPreviewVisible}
          lastAudioCharacterIdRef={lastAudioCharacterIdRef}
          lastAudioStartedAtRef={lastAudioStartedAtRef}
          onMouseEnter={clearHoverTimeout}
          onMouseLeave={handleHoverEnd}
          preview={hoveredPreview}
          previewVideoCache={previewVideoCache}
        />
      ) : null}

      {selectedCharacter ? (
        <CharacterPreviewModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
        />
      ) : null}
    </div>
  );
}
