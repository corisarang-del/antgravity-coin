import { NextResponse } from "next/server";
import { getRequestOwnerId } from "@/infrastructure/auth/requestOwner";
import { FileBattleSnapshotRepository } from "@/infrastructure/db/fileBattleSnapshotRepository";
import { FileEventLog } from "@/infrastructure/db/fileEventLog";
import {
  consumeSharedRequestRateLimit,
  getRequestRateLimitKey,
} from "@/shared/utils/requestRateLimiter";

const MINUTE_WINDOW_MS = 60_000;

function createThrottleResponse(
  error: "rate_limit_exceeded" | "rate_limit_unavailable",
  retryAfterSeconds: number,
) {
  return NextResponse.json(
    { error },
    {
      status: error === "rate_limit_unavailable" ? 503 : 429,
      headers: {
        "Retry-After": `${retryAfterSeconds}`,
      },
    },
  );
}

export async function GET(request: Request) {
  const battleId = new URL(request.url).searchParams.get("battleId");

  if (!battleId) {
    return NextResponse.json({ error: "missing_battle_id" }, { status: 400 });
  }

  const { ownerId, supabase } = await getRequestOwnerId();
  const rateLimit = await consumeSharedRequestRateLimit({
    supabase,
    bucket: "battle-events-get",
    key: getRequestRateLimitKey(request, "battle-events-get", ownerId),
    max: 60,
    windowMs: MINUTE_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return createThrottleResponse(
      rateLimit.reason === "shared_unavailable"
        ? "rate_limit_unavailable"
        : "rate_limit_exceeded",
      rateLimit.retryAfterSeconds,
    );
  }

  const snapshotRepository = new FileBattleSnapshotRepository();
  const snapshot = await snapshotRepository.getSnapshotByBattleIdForUser(battleId, ownerId);

  if (!snapshot) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const eventLog = new FileEventLog();
  const events = await eventLog.listByBattleId(battleId);

  return NextResponse.json({
    ok: true,
    events,
  });
}
