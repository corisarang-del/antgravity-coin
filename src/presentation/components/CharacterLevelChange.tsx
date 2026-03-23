import { characters } from "@/shared/constants/characters";

interface CharacterLevelChangeProps {
  winningTeam: "bull" | "bear" | "draw";
}

const winnersByTeam = {
  bull: characters.filter((character) => character.team === "bull"),
  bear: characters.filter((character) => character.team === "bear"),
} as const;

export function CharacterLevelChange({ winningTeam }: CharacterLevelChangeProps) {
  if (winningTeam === "draw") {
    return null;
  }

  const winners = winnersByTeam[winningTeam];

  return (
    <section className="rounded-[24px] border border-border bg-card p-5">
      <p className="text-xs font-semibold text-muted-foreground">성장한 캐릭터</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {winners.map((character) => (
          <div key={character.id} className="rounded-[18px] bg-[hsl(var(--surface-2))] px-4 py-3">
            <p className="font-semibold">{character.name}</p>
            <p className="text-xs text-muted-foreground">승리 팀 보너스 +1</p>
          </div>
        ))}
      </div>
    </section>
  );
}
