"use client";

import { useRef, useState } from "react";
import { characters } from "@/shared/constants/characters";

function getPreviewVideoSrc(characterId: string) {
  return `/characters/previews/${characterId}.mp4`;
}

export function LandingEnterOverlay() {
  const unlockVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isEntered, setIsEntered] = useState(false);

  const handleEnter = async () => {
    if (unlockVideoRef.current) {
      try {
        unlockVideoRef.current.currentTime = 0;
        unlockVideoRef.current.muted = false;
        unlockVideoRef.current.volume = 0.01;
        await unlockVideoRef.current.play();
        window.setTimeout(() => {
          if (!unlockVideoRef.current) {
            return;
          }

          unlockVideoRef.current.pause();
          unlockVideoRef.current.currentTime = 0;
          unlockVideoRef.current.volume = 1;
        }, 120);
      } catch {
        unlockVideoRef.current.pause();
        unlockVideoRef.current.currentTime = 0;
        unlockVideoRef.current.muted = true;
      }
    }

    setIsEntered(true);
  };

  if (isEntered) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] bg-[linear-gradient(135deg,hsl(var(--landing-hero-ink))_0%,hsl(var(--landing-hero-deep))_55%,hsl(var(--landing-hero-blush))_100%)] px-4 text-white">
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
          onClick={() => {
            void handleEnter();
          }}
          type="button"
        >
          입장
        </button>
        <video
          ref={unlockVideoRef}
          className="hidden"
          playsInline
          preload="auto"
          src={getPreviewVideoSrc(characters[4].id)}
        />
      </div>
    </div>
  );
}
