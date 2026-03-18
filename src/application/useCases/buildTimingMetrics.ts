export interface BattleTimingMetrics {
  requestStartedAt: number;
  marketDataReadyAt: number | null;
  firstCharacterStartedAt: number | null;
  firstMessageDisplayedAt: number | null;
  debateCompletedAt: number | null;
}

export function createBattleTimingTracker(now: () => number = () => Date.now()) {
  const metrics: BattleTimingMetrics = {
    requestStartedAt: now(),
    marketDataReadyAt: null,
    firstCharacterStartedAt: null,
    firstMessageDisplayedAt: null,
    debateCompletedAt: null,
  };

  return {
    markMarketDataReady() {
      metrics.marketDataReadyAt ??= now();
    },
    markFirstCharacterStarted() {
      metrics.firstCharacterStartedAt ??= now();
    },
    markFirstMessageDisplayed() {
      metrics.firstMessageDisplayedAt ??= now();
    },
    markDebateCompleted() {
      metrics.debateCompletedAt ??= now();
    },
    getMetrics() {
      return { ...metrics };
    },
  };
}
