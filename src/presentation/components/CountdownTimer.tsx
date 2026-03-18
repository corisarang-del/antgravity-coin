"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  seconds: number;
}

export function CountdownTimer({ seconds }: CountdownTimerProps) {
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
      <p className="text-xs font-semibold text-muted-foreground">결과 공개까지</p>
      <p className="mt-2 font-display text-4xl font-bold tracking-[-0.05em]">{remainingSeconds}s</p>
      <p className="mt-2 text-sm text-muted-foreground">데모 환경이라 단축 카운트다운으로 표시한다.</p>
    </div>
  );
}
