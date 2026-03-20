import type { BattleTimeframe } from "@/domain/models/BattleTimeframe";
import { battleTimeframeOptions } from "@/shared/constants/battleTimeframes";

interface TimeframeSelectorProps {
  value: BattleTimeframe;
  onChange: (value: BattleTimeframe) => void;
}

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return (
    <div className="grid gap-2 rounded-[24px] border border-border bg-[hsl(var(--surface-2))] p-2 sm:grid-cols-2 xl:grid-cols-3">
      {battleTimeframeOptions.map((timeframe) => (
        <button
          key={timeframe.value}
          className={`rounded-[18px] border px-4 py-3 text-left transition focus-visible:ring-2 focus-visible:ring-primary/30 ${
            value === timeframe.value
              ? "border-primary bg-primary text-primary-foreground shadow-[0_10px_22px_rgba(17,29,61,0.16)]"
              : "border-transparent bg-transparent text-muted-foreground hover:bg-card hover:text-foreground"
          }`}
          onClick={() => onChange(timeframe.value)}
          type="button"
        >
          <p className="text-sm font-semibold">{timeframe.label}</p>
          <p
            className={`mt-1 text-xs ${
              value === timeframe.value ? "text-primary-foreground/80" : "text-muted-foreground"
            }`}
          >
            {timeframe.description}
          </p>
        </button>
      ))}
    </div>
  );
}
