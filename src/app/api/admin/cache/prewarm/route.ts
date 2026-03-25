import { NextResponse } from "next/server";
import { prewarmMarketCache } from "@/application/useCases/prewarmMarketCache";
import { getAdminAccess } from "@/infrastructure/auth/adminAccess";
import { cachePolicy } from "@/shared/constants/cachePolicy";
import {
  consumeSharedRequestRateLimit,
  getRequestRateLimitKey,
} from "@/shared/utils/requestRateLimiter";

export async function POST(request: Request) {
  const adminAccess = await getAdminAccess();
  if (!adminAccess.allowed || !adminAccess.user) {
    return NextResponse.json({ error: "forbidden" }, { status: adminAccess.status });
  }

  const rateLimit = await consumeSharedRequestRateLimit({
    supabase: adminAccess.supabase,
    bucket: "admin-prewarm-post",
    key: getRequestRateLimitKey(request, "admin-prewarm-post", adminAccess.user.id),
    max: 2,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "rate_limit_exceeded" },
      {
        status: 429,
        headers: {
          "Retry-After": `${rateLimit.retryAfterSeconds}`,
        },
      },
    );
  }

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
