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

const BASE_URL = "https://api.bybit.com";

function toLinearSymbol(symbol: string) {
  return `${symbol.toUpperCase()}USDT`;
}

export async function fetchBybitLongShortRatio(symbol: string) {
  const url = new URL(`${BASE_URL}/v5/market/account-ratio`);
  url.searchParams.set("category", "linear");
  url.searchParams.set("symbol", toLinearSymbol(symbol));
  url.searchParams.set("period", "1h");
  url.searchParams.set("limit", "1");

  const response = await fetch(url, {
    next: { revalidate: 300 },
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
}
