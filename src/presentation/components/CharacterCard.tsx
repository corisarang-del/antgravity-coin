import { CharacterImage } from "@/presentation/components/CharacterImage";
import type { Character } from "@/shared/constants/characters";

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
}

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  return (
    <button
      className="overflow-hidden rounded-[24px] border border-border bg-card text-left shadow-[0_18px_40px_rgba(17,29,61,0.08)] transition-transform duration-200 hover:-translate-y-1 hover:border-primary/20 focus-visible:ring-2 focus-visible:ring-primary/30"
      onClick={onClick}
      type="button"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(180deg,hsl(var(--surface-2)),hsl(var(--surface-3)))]">
        <div className="absolute inset-0 flex items-center justify-between px-1">
          <CharacterImage
            alt=""
            aria-hidden="true"
            className="h-full w-[43%] object-contain object-right opacity-55"
            src={character.imageSrc}
          />
          <CharacterImage
            alt=""
            aria-hidden="true"
            className="h-full w-[43%] -scale-x-100 object-contain object-right opacity-55"
            src={character.imageSrc}
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(12,18,36,0.08)_42%,rgba(12,18,36,0.22)_100%)]" />
        <CharacterImage
          alt={character.name}
          className="relative z-10 h-full w-full scale-[1.02] object-contain object-center p-2"
          src={character.imageSrc}
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--surface-3))] text-sm font-bold">
            {character.emoji}
          </div>
          <div>
            <p className="font-display text-2xl font-bold tracking-[-0.04em]">{character.name}</p>
            <p className="text-sm text-muted-foreground">{character.role}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{character.specialty}</p>
      </div>
    </button>
  );
}
