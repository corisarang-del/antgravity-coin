"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { PreviewVideoCache, type PreviewVideoStatus } from "@/app/previewVideoCache";
import { CharacterImage } from "@/presentation/components/CharacterImage";
import { characters } from "@/shared/constants/characters";
import { cn } from "@/shared/lib/cn";

const LandingCharacterPreviewModal = dynamic(
  () =>
    import("@/app/LandingCharacterPreviewModal").then(
      (module) => module.LandingCharacterPreviewModal,
    ),
  { loading: () => null },
);

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

function CharacterHoverPreview({
  preview,
  isVisible,
  previewVideoCache,
  activeAudioVideoRef,
  lastAudioCharacterIdRef,
  lastAudioStartedAtRef,
  onMouseEnter,
  onMouseLeave,
}: {
  preview: HoverPreviewState;
  isVisible: boolean;
  previewVideoCache: PreviewVideoCache;
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
      !isSameCharacterReplay || Date.now() - lastAudioStartedAtRef.current >= 2000;
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
      <div className="relative aspect-[20/11] overflow-hidden rounded-t-[28px] bg-[linear-gradient(135deg,hsl(var(--landing-hero-ink))_0%,hsl(var(--landing-hero-deep))_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,rgba(8,12,28,0.12)_42%,rgba(8,12,28,0.52)_100%)]" />
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
        ) : (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <CharacterImage
              alt={preview.character.name}
              className="h-full w-full object-contain object-center"
              src={preview.character.imageSrc}
            />
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-white/88">
          <span className="rounded border border-white/20 px-2 py-1 text-xs">캐릭터 미리보기</span>
          <span>{preview.character.team === "bull" ? "불리시" : "베어리시"}</span>
          <span>·</span>
          <span>{preview.character.role}</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-white/88">{preview.character.specialty}</p>
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
}: {
  character: PreviewCharacter;
  onOpen: (character: PreviewCharacter) => void;
  onHoverStart: (character: PreviewCharacter, rect: DOMRect) => void;
  onHoverEnd: () => void;
  onPreload: (character: PreviewCharacter) => void;
}) {
  return (
    <button
      className="group relative w-[12.5rem] shrink-0 snap-start text-left transition-transform duration-300 hover:z-20 hover:scale-[1.08] focus-visible:z-20 focus-visible:scale-[1.08]"
      onClick={() => onOpen(character)}
      onFocus={() => onPreload(character)}
      onMouseEnter={(event) => onHoverStart(character, event.currentTarget.getBoundingClientRect())}
      onMouseLeave={onHoverEnd}
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
          <div className="absolute inset-x-0 bottom-0 z-20 bg-[linear-gradient(180deg,transparent,rgba(6,10,24,0.94))] p-4 text-white">
            <p className="font-display text-2xl font-bold tracking-[-0.05em]">{character.name}</p>
            <p className="mt-1 text-xs text-white/82">{character.role}</p>
          </div>
        </div>
      </div>
    </button>
  );
}

export function LandingCharacterRail() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const activeAudioVideoRef = useRef<HTMLVideoElement | null>(null);
  const lastAudioCharacterIdRef = useRef<string | null>(null);
  const lastAudioStartedAtRef = useRef(0);
  const [previewVideoCache] = useState(() => new PreviewVideoCache());
  const [selectedCharacter, setSelectedCharacter] = useState<PreviewCharacter | null>(null);
  const [hoveredPreview, setHoveredPreview] = useState<HoverPreviewState | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

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
    <>
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
                onHoverEnd={handleHoverEnd}
                onHoverStart={handleHoverStart}
                onOpen={setSelectedCharacter}
                onPreload={preloadCharacterPreview}
              />
            ))}
          </div>
        </div>
      </section>

      {hoveredPreview ? (
        <CharacterHoverPreview
          activeAudioVideoRef={activeAudioVideoRef}
          isVisible={isPreviewVisible}
          key={hoveredPreview.character.id}
          lastAudioCharacterIdRef={lastAudioCharacterIdRef}
          lastAudioStartedAtRef={lastAudioStartedAtRef}
          onMouseEnter={clearHoverTimeout}
          onMouseLeave={handleHoverEnd}
          preview={hoveredPreview}
          previewVideoCache={previewVideoCache}
        />
      ) : null}

      {selectedCharacter ? (
        <LandingCharacterPreviewModal
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
        />
      ) : null}
    </>
  );
}
