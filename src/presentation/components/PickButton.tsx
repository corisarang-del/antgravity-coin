import { cn } from "@/shared/lib/cn";

interface PickButtonProps {
  label: string;
  team: "bull" | "bear";
  selected: boolean;
  onClick: () => void;
}

export function PickButton({ label, team, selected, onClick }: PickButtonProps) {
  return (
    <button
      className={cn(
        "min-h-14 rounded-[20px] border px-4 py-4 text-left font-semibold transition focus-visible:ring-2 focus-visible:ring-primary/30",
        selected
          ? team === "bull"
            ? "border-bull bg-bull/12 text-foreground shadow-[0_12px_24px_rgba(43,153,110,0.12)]"
            : "border-bear bg-bear/12 text-foreground shadow-[0_12px_24px_rgba(237,93,59,0.12)]"
          : "border-border bg-[hsl(var(--surface-2))] hover:border-primary/30 hover:bg-card",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
