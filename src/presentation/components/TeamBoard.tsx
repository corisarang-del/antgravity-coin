import { useMemo } from "react";
import { CharacterImage } from "@/presentation/components/CharacterImage";
import type { DebateMessage } from "@/domain/models/DebateMessage";
import { characters } from "@/shared/constants/characters";
import { cn } from "@/shared/lib/cn";

interface TeamBoardProps {
  activeCharacterId: string | null;
  messages: DebateMessage[];
}

export function TeamBoard({ activeCharacterId, messages }: TeamBoardProps) {
  const messageCountByTeam = useMemo(() => {
    const counts = { bull: 0, bear: 0 };

    for (const message of messages) {
      counts[message.team] += 1;
    }

    return counts;
  }, [messages]);

  return (
    <section className="grid gap-4 rounded-[24px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_16px_36px_rgba(17,29,61,0.06)] md:grid-cols-2">
      {(["bull", "bear"] as const).map((team) => (
        <div key={team} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2
              className={cn(
                "font-display text-2xl font-bold tracking-[-0.04em]",
                team === "bull" ? "text-bull" : "text-bear",
              )}
            >
              {team === "bull" ? "불리시 팀" : "베어리시 팀"}
            </h2>
            <span className="rounded-full bg-[hsl(var(--surface-2))] px-3 py-2 text-xs font-semibold text-muted-foreground">
              {messageCountByTeam[team]}/4 발언
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {characters
              .filter((character) => character.team === team)
              .map((character) => (
                <div
                  key={character.id}
                  className={cn(
                    "rounded-[18px] border px-3 py-3 shadow-[0_10px_24px_rgba(17,29,61,0.04)] transition",
                    activeCharacterId === character.id
                      ? team === "bull"
                        ? "border-bull/70 bg-bull/12"
                        : "border-bear/70 bg-bear/12"
                      : "border-border/70 bg-[hsl(var(--surface-2))]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-2xl border border-border/60 bg-background">
                      <CharacterImage
                        alt={character.name}
                        className="h-full w-full object-cover"
                        sizes="48px"
                        src={character.imageSrc}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{character.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{character.role}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">{character.specialty}</p>
                </div>
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}
