interface IndicatorCardProps {
  label: string;
  value: string;
}

export function IndicatorCard({ label, value }: IndicatorCardProps) {
  return (
    <div className="rounded-[18px] border border-border/70 bg-[linear-gradient(180deg,hsl(var(--surface-2))_0%,hsl(var(--card))_100%)] p-4 shadow-[0_10px_24px_rgba(17,29,61,0.05)]">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold tracking-[-0.04em]">{value}</p>
    </div>
  );
}
