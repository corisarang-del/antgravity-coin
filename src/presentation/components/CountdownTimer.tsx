"use client";

interface CountdownTimerProps {
  seconds: number;
  label?: string;
  description?: string;
}

export function CountdownTimer({
  seconds,
  label = "다음 차트 정산까지",
  description = "실시간 차트와 결과 구간 전환까지 남은 시간을 보여줘.",
}: CountdownTimerProps) {
  return (
    <div className="rounded-[24px] border border-border bg-card p-5">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-4xl font-bold tracking-[-0.05em]">{seconds}s</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
