import { CharacterImage } from "@/presentation/components/CharacterImage";
import type { Character } from "@/shared/constants/characters";

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
  imagePriority?: boolean;
  imageSizes?: string;
}

export function CharacterCard({
  character,
  onClick,
  imagePriority = false,
  imageSizes = "(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(50vw - 1.625rem), 31.5rem",
}: CharacterCardProps) {
  return (
    <button
      className="overflow-hidden rounded-[24px] border border-border bg-card text-left shadow-[0_18px_40px_rgba(17,29,61,0.08)] transition-transform duration-200 hover:-translate-y-1 hover:border-primary/20 focus-visible:ring-2 focus-visible:ring-primary/30"
      onClick={onClick}
      type="button"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(180deg,hsl(var(--surface-2)),hsl(var(--surface-3)))]">
        <div className="absolute inset-0">
          <div className="absolute left-[-12%] top-[10%] h-[72%] w-[40%] rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-[-12%] top-[16%] h-[68%] w-[38%] rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(12,18,36,0.08)_42%,rgba(12,18,36,0.22)_100%)]" />
        <CharacterImage
          alt={character.name}
          className="relative z-10 h-full w-full scale-[1.02] object-contain object-center p-2"
          priority={imagePriority}
          sizes={imageSizes}
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
        <p className="ag-body-copy ag-body-copy-strong mt-4">{character.specialty}</p>
        <div className="mt-4 rounded-[18px] border border-border/80 bg-[hsl(var(--surface-2))] px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground">초보용 한줄 해설</p>
          <p className="ag-body-copy ag-body-copy-strong mt-2 text-sm">
            {character.beginnerSummary}
          </p>
        </div>
      </div>
    </button>
  );
}
