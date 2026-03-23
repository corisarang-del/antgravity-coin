"use client";

import Link from "next/link";
import { CharacterImage } from "@/presentation/components/CharacterImage";
import type { Character } from "@/shared/constants/characters";

interface LandingCharacterPreviewModalProps {
  character: Character;
  onClose: () => void;
}

export function LandingCharacterPreviewModal({
  character,
  onClose,
}: LandingCharacterPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--foreground)/0.6)] p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[84rem] overflow-hidden rounded-[32px] border border-white/20 bg-[hsl(var(--landing-hero-ink))] text-[hsl(var(--background))] shadow-[0_40px_100px_rgba(0,0,0,0.45)]">
        <button
          aria-label="닫기"
          className="absolute right-4 top-4 z-20 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/15 px-3 text-sm font-semibold text-[hsl(var(--background))]"
          onClick={onClose}
          type="button"
        >
          닫기
        </button>
        <div className="grid min-h-[34rem] md:grid-cols-[1.25fr_0.75fr]">
          <div className="relative min-h-[24rem] bg-[hsl(var(--foreground)/0.08)] p-6">
            <CharacterImage
              alt={character.name}
              className="h-full w-full object-contain object-center"
              src={character.imageSrc}
            />
          </div>
          <div className="flex flex-col justify-end gap-4 p-6 md:p-8">
            <span className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--background)/0.72)]">
              캐릭터 미리보기
            </span>
            <h3 className="font-display text-5xl font-bold tracking-[-0.06em]">{character.name}</h3>
            <p className="text-sm font-semibold text-[hsl(var(--background)/0.78)]">{character.role}</p>
            <p className="text-sm leading-7 text-[hsl(var(--background)/0.74)]">{character.specialty}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                className="inline-flex min-h-12 items-center rounded-full bg-[hsl(var(--background))] px-5 py-3 text-sm font-semibold text-[hsl(var(--landing-hero-ink))]"
                href="/home"
              >
                홈으로 이동
              </Link>
              <Link
                className="inline-flex min-h-12 items-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-[hsl(var(--background))]"
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
