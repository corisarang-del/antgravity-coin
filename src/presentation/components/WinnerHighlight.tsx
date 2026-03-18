import type { DebateMessage } from "@/domain/models/DebateMessage";

interface WinnerHighlightProps {
  messages: DebateMessage[];
  winningTeam: "bull" | "bear" | "draw";
}

function scoreMessage(message: DebateMessage) {
  const hasIndicator = message.indicatorLabel.trim().length > 0 && message.indicatorValue.trim().length > 0;
  const summaryLengthScore = Math.min(message.summary.trim().length, 90);
  const detailLengthScore = Math.min(message.detail.trim().length, 140) / 10;

  return summaryLengthScore + detailLengthScore + (hasIndicator ? 40 : 0);
}

export function WinnerHighlight({ messages, winningTeam }: WinnerHighlightProps) {
  if (winningTeam === "draw") {
    return null;
  }

  const winnerMessages = messages
    .filter((message) => message.team === winningTeam)
    .sort((left, right) => scoreMessage(right) - scoreMessage(left))
    .filter(
      (message, index, collection) =>
        collection.findIndex((candidate) => candidate.characterId === message.characterId) === index,
    )
    .slice(0, 2);

  return (
    <section className="rounded-[24px] border border-border bg-card p-5">
      <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">승리 팀 핵심 발언</h2>
      <div className="mt-4 grid gap-3">
        {winnerMessages.map((message) => (
          <article key={message.id} className="rounded-[18px] bg-[hsl(var(--surface-2))] px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{message.characterName}</p>
              <span className="text-xs font-semibold text-muted-foreground">
                {message.indicatorLabel} {message.indicatorValue}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{message.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
