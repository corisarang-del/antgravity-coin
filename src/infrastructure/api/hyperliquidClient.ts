import { fetchWithTimeout } from "@/shared/utils/fetchWithTimeout";

type HyperliquidUniverse = Array<{
  name?: string;
}>;

type HyperliquidAssetContext = Array<{
  funding?: string;
  markPx?: string;
  midPx?: string;
  openInterest?: string;
  dayNtlVlm?: string;
  premium?: string;
}>;

type HyperliquidMetaAndAssetCtxsResponse =
  | [{ universe: HyperliquidUniverse }, HyperliquidAssetContext]
  | [HyperliquidUniverse, HyperliquidAssetContext];

const BASE_URL = "https://api.hyperliquid.xyz/info";

function toNumber(value: string | undefined, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function fetchHyperliquidPerpetualMetrics(symbol: string) {
  const response = await fetchWithTimeout(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "metaAndAssetCtxs",
    }),
    next: { revalidate: 300 },
    timeoutMs: 4_000,
  });

  if (!response.ok) {
    throw new Error(`Hyperliquid info request failed: ${response.status}`);
  }

  const payload = (await response.json()) as HyperliquidMetaAndAssetCtxsResponse;
  const [universeLike, assetContexts] = payload;
  const universe = Array.isArray(universeLike)
    ? universeLike
    : universeLike.universe;

  if (!Array.isArray(universe)) {
    throw new Error("Hyperliquid universe shape invalid");
  }

  const assetIndex = universe.findIndex((asset) => asset.name === symbol.toUpperCase());

  if (assetIndex === -1) {
    throw new Error("Hyperliquid asset not found");
  }

  const context = assetContexts[assetIndex];
  if (!context) {
    throw new Error("Hyperliquid asset context missing");
  }

  const markPrice = toNumber(context.markPx || context.midPx);
  const openInterestBase = toNumber(context.openInterest);
  const dayNotionalVolume = toNumber(context.dayNtlVlm);
  const fundingRateRaw = toNumber(context.funding);
  const premium = Math.abs(toNumber(context.premium));

  if (markPrice <= 0 || openInterestBase <= 0 || dayNotionalVolume <= 0) {
    throw new Error("Hyperliquid asset context invalid");
  }

  const openInterest = openInterestBase * markPrice;
  const fundingRate = Number((fundingRateRaw * 100).toFixed(4));
  const oiPressure = Math.min(1, openInterest / dayNotionalVolume);
  const fundingPressure = Math.min(1, Math.abs(fundingRate) / 0.2);
  const premiumPressure = Math.min(1, premium / 0.01);
  const whaleScore = Math.max(
    0,
    Math.min(100, Math.round(35 + oiPressure * 40 + fundingPressure * 15 + premiumPressure * 10)),
  );

  return {
    openInterest: Number(openInterest.toFixed(2)),
    fundingRate,
    whaleScore,
  };
}
