"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  seconds: number;
  label?: string;
  description?: string;
}

export function CountdownTimer({
  seconds,
  label = "다음 차트 확정까지",
  description = "실시간 차트형 연출을 위해 짧은 카운트다운으로 결과 구간을 전환하고 있어.",
}: CountdownTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(seconds);

  useEffect(() => {
    setRemainingSeconds(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remainingSeconds === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((currentSeconds) => (currentSeconds > 0 ? currentSeconds - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [remainingSeconds]);

  return (
    <div className="rounded-[24px] border border-border bg-card p-5">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-4xl font-bold tracking-[-0.05em]">{remainingSeconds}s</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
