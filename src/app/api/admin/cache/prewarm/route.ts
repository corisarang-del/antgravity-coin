import { NextResponse } from "next/server";
import { prewarmMarketCache } from "@/application/useCases/prewarmMarketCache";
import { cachePolicy } from "@/shared/constants/cachePolicy";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    coinIds?: string[];
  };

  const requestedCoinIds =
    body.coinIds?.filter((coinId) => typeof coinId === "string" && coinId.trim().length > 0) ??
    cachePolicy.prewarmCoinIds;

  const results = await prewarmMarketCache(requestedCoinIds);

  return NextResponse.json({
    ok: true,
    coinIds: requestedCoinIds,
    results,
  });
}
