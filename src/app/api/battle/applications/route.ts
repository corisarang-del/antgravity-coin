import { NextResponse } from "next/server";
import { getRequestOwnerId } from "@/infrastructure/auth/requestOwner";
import { FileBattleResultApplicationRepository } from "@/infrastructure/db/fileBattleResultApplicationRepository";
import {
  consumeSharedRequestRateLimit,
  getRequestRateLimitKey,
} from "@/shared/utils/requestRateLimiter";

const MINUTE_WINDOW_MS = 60_000;
const DAILY_WINDOW_MS = 86_400_000;

async function consumeApplicationsRateLimit(
  request: Request,
  input: {
    bucket: string;
    ownerId: string;
    supabase: Awaited<ReturnType<typeof getRequestOwnerId>>["supabase"];
    max: number;
    windowMs: number;
  },
) {
  return consumeSharedRequestRateLimit({
    supabase: input.supabase,
    bucket: input.bucket,
    key: getRequestRateLimitKey(request, input.bucket, input.ownerId),
    max: input.max,
    windowMs: input.windowMs,
  });
}

function createThrottleResponse(error: "rate_limit_exceeded" | "daily_quota_exceeded", retryAfterSeconds: number) {
  return NextResponse.json(
    { error },
    {
      status: 429,
      headers: {
        "Retry-After": `${retryAfterSeconds}`,
      },
    },
  );
}

export async function GET(request: Request) {
  const { ownerId: userId, supabase } = await getRequestOwnerId();
  const rateLimit = await consumeApplicationsRateLimit(request, {
    bucket: "battle-applications-get",
    ownerId: userId,
    supabase,
    max: 60,
    windowMs: MINUTE_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return createThrottleResponse("rate_limit_exceeded", rateLimit.retryAfterSeconds);
  }

  const battleId = new URL(request.url).searchParams.get("battleId");

  if (!battleId) {
    return NextResponse.json({ error: "missing_battle_id" }, { status: 400 });
  }

  const repository = new FileBattleResultApplicationRepository();
  const applied = await repository.hasApplied(battleId, userId);

  return NextResponse.json({ applied, userId });
}

export async function POST(request: Request) {
  const { ownerId: userId, supabase } = await getRequestOwnerId();
  const rateLimit = await consumeApplicationsRateLimit(request, {
    bucket: "battle-applications-post",
    ownerId: userId,
    supabase,
    max: 20,
    windowMs: MINUTE_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return createThrottleResponse("rate_limit_exceeded", rateLimit.retryAfterSeconds);
  }

  const dailyQuota = await consumeApplicationsRateLimit(request, {
    bucket: "battle-applications-post-daily",
    ownerId: userId,
    supabase,
    max: 240,
    windowMs: DAILY_WINDOW_MS,
  });

  if (!dailyQuota.allowed) {
    return createThrottleResponse("daily_quota_exceeded", dailyQuota.retryAfterSeconds);
  }

  const body = (await request.json()) as {
    battleId?: string;
  };

  if (!body.battleId) {
    return NextResponse.json({ error: "missing_battle_id" }, { status: 400 });
  }

  const repository = new FileBattleResultApplicationRepository();
  await repository.markApplied({
    battleId: body.battleId,
    userId,
    appliedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, userId });
}
