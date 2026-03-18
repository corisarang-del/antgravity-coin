import type { DebateMessage } from "@/domain/models/DebateMessage";
import { cn } from "@/shared/lib/cn";

interface BattleFeedProps {
  messages: DebateMessage[];
}

export function BattleFeed({ messages }: BattleFeedProps) {
  return (
    <section
      aria-live="polite"
      className="space-y-3 rounded-[24px] border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_16px_32px_rgba(17,29,61,0.06)]"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold tracking-[-0.04em]">배틀 피드</h2>
        <span className="rounded-full bg-[hsl(var(--surface-2))] px-3 py-2 text-xs font-semibold text-muted-foreground">
          {messages.length}/8 발언
        </span>
      </div>
      <div className="grid gap-3">
        {messages.map((message) => (
          <article
            key={message.id}
            className={cn(
              "w-full rounded-[20px] border px-4 py-4 text-sm leading-6 [content-visibility:auto]",
              message.team === "bull"
                ? "border-bull/20 bg-bull/10 text-foreground"
                : "border-bear/20 bg-bear/10 text-foreground",
            )}
            data-team={message.team}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <strong>{message.characterName}</strong>
              <span className="text-xs font-semibold text-muted-foreground">
                {message.indicatorLabel} {message.indicatorValue}
              </span>
            </div>
            <p className="mb-2 font-semibold">{message.summary}</p>
            <p className="text-muted-foreground">{message.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
