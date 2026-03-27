import { NextResponse } from "next/server";
import { searchCoins } from "@/application/useCases/searchCoins";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";
import { CoinGeckoRepository } from "@/infrastructure/db/coinGeckoRepository";
import { hasSupabasePublicEnv } from "@/shared/constants/envConfig";
import {
  consumeSharedRequestRateLimit,
  getRequestRateLimitKey,
} from "@/shared/utils/requestRateLimiter";

const MINUTE_WINDOW_MS = 60_000;
const MAX_QUERY_LENGTH = 64;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (query.length === 0) {
    return NextResponse.json({ coins: [] });
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json({ error: "invalid_query" }, { status: 400 });
  }

  const supabase = hasSupabasePublicEnv ? await createSupabaseServerClient() : null;
  const rateLimit = await consumeSharedRequestRateLimit({
    supabase,
    bucket: "coin-search-get",
    key: getRequestRateLimitKey(request, "coin-search-get", "public"),
    max: 30,
    windowMs: MINUTE_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error:
          rateLimit.reason === "shared_unavailable"
            ? "rate_limit_unavailable"
            : "rate_limit_exceeded",
      },
      {
        status: rateLimit.reason === "shared_unavailable" ? 503 : 429,
        headers: {
          "Retry-After": `${rateLimit.retryAfterSeconds}`,
        },
      },
    );
  }

  const repository = new CoinGeckoRepository();
  const coins = await searchCoins(repository, query);

  return NextResponse.json({ coins });
}
