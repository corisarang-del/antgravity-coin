export interface BattleTimingMetrics {
  requestStartedAt: number;
  marketDataReadyAt: number | null;
  firstCharacterStartedAt: number | null;
  firstMessageDisplayedAt: number | null;
  debateCompletedAt: number | null;
  preparedContextHit: boolean | null;
  preparedFirstTurnHit: boolean | null;
  preparedAtAgeMs: number | null;
}

export function createBattleTimingTracker(now: () => number = () => Date.now()) {
  const metrics: BattleTimingMetrics = {
    requestStartedAt: now(),
    marketDataReadyAt: null,
    firstCharacterStartedAt: null,
    firstMessageDisplayedAt: null,
    debateCompletedAt: null,
    preparedContextHit: null,
    preparedFirstTurnHit: null,
    preparedAtAgeMs: null,
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
    markPreparedContext(input: {
      preparedContextHit: boolean;
      preparedFirstTurnHit: boolean;
      preparedAtAgeMs: number | null;
    }) {
      metrics.preparedContextHit ??= input.preparedContextHit;
      metrics.preparedFirstTurnHit ??= input.preparedFirstTurnHit;
      metrics.preparedAtAgeMs ??= input.preparedAtAgeMs;
    },
    getMetrics() {
      return { ...metrics };
    },
  };
}
