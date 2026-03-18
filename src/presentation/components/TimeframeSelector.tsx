interface TimeframeSelectorProps {
  value: "24h" | "7d";
  onChange: (value: "24h" | "7d") => void;
}

export function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex gap-2 rounded-[20px] border border-border bg-[hsl(var(--surface-2))] p-2">
      {(["24h", "7d"] as const).map((timeframe) => (
        <button
          key={timeframe}
          className={`min-h-11 flex-1 rounded-[16px] px-4 py-3 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-primary/30 ${
            value === timeframe
              ? "bg-primary text-primary-foreground shadow-[0_10px_22px_rgba(17,29,61,0.16)]"
              : "text-muted-foreground hover:bg-card hover:text-foreground"
          }`}
          onClick={() => onChange(timeframe)}
          type="button"
        >
          {timeframe}
        </button>
      ))}
    </div>
  );
}
