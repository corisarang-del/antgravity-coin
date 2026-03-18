import { CharacterImage } from "@/presentation/components/CharacterImage";
import type { DebateMessage } from "@/domain/models/DebateMessage";
import { getCharacterById } from "@/shared/constants/characters";

interface SpeakerSpotlightProps {
  message: DebateMessage | null;
}

export function SpeakerSpotlight({ message }: SpeakerSpotlightProps) {
  if (!message) {
    return (
      <section className="rounded-[24px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--surface-2))_0%,hsl(var(--card))_100%)] p-5 text-sm text-muted-foreground shadow-[0_12px_28px_rgba(17,29,61,0.05)]">
        발언 시작 전이야. 곧 첫 캐릭터가 등장해.
      </section>
    );
  }

  const character = getCharacterById(message.characterId);

  return (
    <section className="rounded-[24px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_16px_32px_rgba(17,29,61,0.06)]">
      <p className="text-xs font-semibold text-muted-foreground">현재 스포트라이트</p>
      <div className="mt-3 flex items-start gap-4">
        {character ? (
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[22px] border border-border/60 bg-[hsl(var(--surface-2))]">
            <CharacterImage
              alt={character.name}
              className="h-full w-full object-cover"
              sizes="96px"
              src={character.imageSrc}
            />
          </div>
        ) : null}
        <div className="min-w-0">
          <h2 className="font-display text-3xl font-bold tracking-[-0.05em]">
            {message.characterName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {character?.role ?? "캐릭터 분석가"}
          </p>
          <p className="mt-2 text-sm font-semibold">{message.summary}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{message.detail}</p>
        </div>
      </div>
    </section>
  );
}
