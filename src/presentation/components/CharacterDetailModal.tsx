import { useEffect, useEffectEvent, useId, useRef } from "react";
import { CharacterImage } from "@/presentation/components/CharacterImage";
import type { Character } from "@/shared/constants/characters";

interface CharacterDetailModalProps {
  character: Character | null;
  onClose: () => void;
}

export function CharacterDetailModal({ character, onClose }: CharacterDetailModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const handleEscapeClose = useEffectEvent(() => {
    onClose();
  });

  useEffect(() => {
    if (!character) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleEscapeClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [character]);

  if (!character) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end bg-[hsl(var(--foreground)/0.35)] p-4 md:items-center md:justify-center">
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-md overflow-hidden rounded-[28px] bg-card shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
        role="dialog"
      >
        <div className="aspect-square overflow-hidden bg-[hsl(var(--surface-2))]">
          <CharacterImage
            alt={character.name}
            className="h-full w-full object-cover object-center"
            sizes="(max-width: 768px) 100vw, 512px"
            src={character.imageSrc}
          />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-3xl font-bold tracking-[-0.05em]" id={titleId}>
                {character.name}
              </p>
              <p className="text-sm text-muted-foreground">{character.role}</p>
            </div>
            <button
              aria-label="닫기"
              className="min-h-11 rounded-full bg-[hsl(var(--surface-2))] px-3 py-2 text-sm font-semibold"
              onClick={onClose}
              ref={closeButtonRef}
              type="button"
            >
              닫기
            </button>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground" id={descriptionId}>
            {character.specialty}
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm font-semibold">성격</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{character.personality}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">고른 이유</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{character.selectionReason}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
