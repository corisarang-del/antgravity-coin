import type { BattleTimeframe } from "@/domain/models/BattleTimeframe";

interface BybitAccountRatioItem {
  buyRatio?: string;
  sellRatio?: string;
  longAccount?: string;
  shortAccount?: string;
}

interface BybitAccountRatioResponse {
  result?: {
    list?: BybitAccountRatioItem[];
  };
}

type BybitKlineInterval = "1" | "5" | "30" | "60" | "240" | "D" | "W";

interface BybitKlineResponse {
  result?: {
    list?: string[][];
  };
}

export interface BybitKlineCandle {
  startTimeMs: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  volume: number;
  turnover: number;
  endTimeMs: number;
}

const BASE_URL = "https://api.bybit.com";
const BYBIT_TIMEOUT_MS = 4_000;

function toLinearSymbol(symbol: string) {
  return `${symbol.toUpperCase()}USDT`;
}

function getIntervalDurationMs(interval: BybitKlineInterval) {
  switch (interval) {
    case "1":
      return 60_000;
    case "5":
      return 5 * 60_000;
    case "30":
      return 30 * 60_000;
    case "60":
      return 60 * 60_000;
    case "240":
      return 4 * 60 * 60_000;
    case "D":
      return 24 * 60 * 60_000;
    case "W":
      return 7 * 24 * 60 * 60_000;
  }
}

export function mapBattleTimeframeToBybitInterval(timeframe: BattleTimeframe): BybitKlineInterval {
  switch (timeframe) {
    case "5m":
      return "5";
    case "30m":
      return "30";
    case "1h":
      return "60";
    case "4h":
      return "240";
    case "24h":
      return "D";
    case "7d":
      return "W";
  }
}

export async function fetchBybitLongShortRatio(symbol: string) {
  const url = new URL(`${BASE_URL}/v5/market/account-ratio`);
  url.searchParams.set("category", "linear");
  url.searchParams.set("symbol", toLinearSymbol(symbol));
  url.searchParams.set("period", "1h");
  url.searchParams.set("limit", "1");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BYBIT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      next: { revalidate: 300 },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Bybit account ratio request failed: ${response.status}`);
    }

    const data = (await response.json()) as BybitAccountRatioResponse;
    const latest = data.result?.list?.[0];

    if (!latest) {
      throw new Error("Bybit account ratio response empty");
    }

    const buyRatio = Number(latest.buyRatio ?? latest.longAccount);
    const sellRatio = Number(latest.sellRatio ?? latest.shortAccount);

    if (!Number.isFinite(buyRatio) || !Number.isFinite(sellRatio) || sellRatio <= 0) {
      throw new Error("Bybit account ratio response invalid");
    }

    return Number((buyRatio / sellRatio).toFixed(2));
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchBybitKlines(input: {
  marketSymbol: string;
  interval: BybitKlineInterval;
  limit?: number;
  startMs?: number;
  endMs?: number;
}) {
  const url = new URL(`${BASE_URL}/v5/market/kline`);
  url.searchParams.set("category", "linear");
  url.searchParams.set("symbol", input.marketSymbol);
  url.searchParams.set("interval", input.interval);
  url.searchParams.set("limit", `${input.limit ?? 20}`);

  if (input.startMs) {
    url.searchParams.set("start", `${input.startMs}`);
  }

  if (input.endMs) {
    url.searchParams.set("end", `${input.endMs}`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), BYBIT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      next: { revalidate: 30 },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Bybit kline request failed: ${response.status}`);
    }

    const data = (await response.json()) as BybitKlineResponse;
    const candles = (data.result?.list ?? [])
      .map((item) => {
        const startTimeMs = Number(item[0]);
        const openPrice = Number(item[1]);
        const highPrice = Number(item[2]);
        const lowPrice = Number(item[3]);
        const closePrice = Number(item[4]);
        const volume = Number(item[5]);
        const turnover = Number(item[6]);

        if (
          !Number.isFinite(startTimeMs) ||
          !Number.isFinite(openPrice) ||
          !Number.isFinite(highPrice) ||
          !Number.isFinite(lowPrice) ||
          !Number.isFinite(closePrice)
        ) {
          return null;
        }

        return {
          startTimeMs,
          openPrice,
          highPrice,
          lowPrice,
          closePrice,
          volume: Number.isFinite(volume) ? volume : 0,
          turnover: Number.isFinite(turnover) ? turnover : 0,
          endTimeMs: startTimeMs + getIntervalDurationMs(input.interval),
        } satisfies BybitKlineCandle;
      })
      .filter((candle): candle is BybitKlineCandle => candle !== null)
      .sort((left, right) => left.startTimeMs - right.startTimeMs);

    if (candles.length === 0) {
      throw new Error("Bybit kline response empty");
    }

    return candles;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchBybitEntryCandleClose(marketSymbol: string, selectedAt: string) {
  const selectedAtMs = Date.parse(selectedAt);
  const candles = await fetchBybitKlines({
    marketSymbol,
    interval: "1",
    startMs: selectedAtMs - 60_000,
    endMs: selectedAtMs + 10 * 60_000,
    limit: 20,
  });

  const entryCandle =
    candles.find((candle) => candle.endTimeMs >= selectedAtMs) ?? candles[candles.length - 1];

  if (!entryCandle) {
    throw new Error("Bybit entry candle not found");
  }

  return entryCandle;
}

export async function fetchBybitSettlementCandleClose(
  marketSymbol: string,
  timeframe: BattleTimeframe,
  settlementAt: string,
) {
  const settlementAtMs = Date.parse(settlementAt);
  const interval = mapBattleTimeframeToBybitInterval(timeframe);
  const candles = await fetchBybitKlines({
    marketSymbol,
    interval,
    startMs: settlementAtMs - getIntervalDurationMs(interval),
    endMs: settlementAtMs + getIntervalDurationMs(interval),
    limit: 5,
  });

  const settlementCandle =
    candles.find(
      (candle) => candle.startTimeMs <= settlementAtMs && settlementAtMs < candle.endTimeMs,
    ) ?? candles[candles.length - 1];

  if (!settlementCandle) {
    throw new Error("Bybit settlement candle not found");
  }

  return settlementCandle;
}
