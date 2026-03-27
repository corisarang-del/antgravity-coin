import { NextResponse } from "next/server";
import type { BattleSnapshotRecord } from "@/domain/models/BattleSnapshotRecord";
import { FileBattleSnapshotRepository } from "@/infrastructure/db/fileBattleSnapshotRepository";
import { persistAuthenticatedBattleSnapshot } from "@/infrastructure/db/supabaseBattlePersistence";
import { getRequestOwnerId } from "@/infrastructure/auth/requestOwner";
import {
  consumeSharedRequestRateLimit,
  getRequestRateLimitKey,
} from "@/shared/utils/requestRateLimiter";

const MINUTE_WINDOW_MS = 60_000;
const DAILY_WINDOW_MS = 86_400_000;

async function consumeSnapshotRateLimit(
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

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<BattleSnapshotRecord>;

  if (!body.snapshotId || !body.coinId || !body.messages) {
    return NextResponse.json({ error: "missing_snapshot_payload" }, { status: 400 });
  }

  const { ownerId, user, supabase } = await getRequestOwnerId();
  const rateLimit = await consumeSnapshotRateLimit(request, {
    bucket: "battle-snapshot-post",
    ownerId,
    supabase,
    max: 20,
    windowMs: MINUTE_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return createThrottleResponse("rate_limit_exceeded", rateLimit.retryAfterSeconds);
  }

  const dailyQuota = await consumeSnapshotRateLimit(request, {
    bucket: "battle-snapshot-post-daily",
    ownerId,
    supabase,
    max: 240,
    windowMs: DAILY_WINDOW_MS,
  });

  if (!dailyQuota.allowed) {
    return createThrottleResponse("daily_quota_exceeded", dailyQuota.retryAfterSeconds);
  }

  const repository = new FileBattleSnapshotRepository();
  const existingSnapshot = await repository.getSnapshot(body.snapshotId);

  if (existingSnapshot && existingSnapshot.userId !== ownerId) {
    return NextResponse.json({ error: "snapshot_owner_mismatch" }, { status: 403 });
  }

  const snapshot: BattleSnapshotRecord = {
    snapshotId: body.snapshotId,
    userId: ownerId,
    battleId: body.battleId ?? existingSnapshot?.battleId ?? null,
    coinId: body.coinId,
    marketData: body.marketData ?? null,
    summary: body.summary ?? null,
    messages: body.messages,
    savedAt: body.savedAt ?? new Date().toISOString(),
  };

  await repository.saveSnapshot(snapshot);

  if (user) {
    await persistAuthenticatedBattleSnapshot(supabase, user, snapshot);
  }

  return NextResponse.json({
    ok: true,
    snapshotId: snapshot.snapshotId,
    userId: snapshot.userId,
    battleId: snapshot.battleId,
    savedAt: snapshot.savedAt,
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const snapshotId = url.searchParams.get("snapshotId");
  const battleId = url.searchParams.get("battleId");
  const { ownerId, supabase } = await getRequestOwnerId();
  const rateLimit = await consumeSnapshotRateLimit(request, {
    bucket: "battle-snapshot-get",
    ownerId,
    supabase,
    max: 60,
    windowMs: MINUTE_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return createThrottleResponse("rate_limit_exceeded", rateLimit.retryAfterSeconds);
  }

  const repository = new FileBattleSnapshotRepository();

  if (!snapshotId && !battleId) {
    return NextResponse.json({ error: "missing_snapshot_lookup_key" }, { status: 400 });
  }

  if (battleId) {
    const snapshot = await repository.getSnapshotByBattleIdForUser(battleId, ownerId);

    if (!snapshot) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      snapshotId: snapshot.snapshotId,
      battleId: snapshot.battleId,
      coinId: snapshot.coinId,
      ownerMatched: snapshot.userId === ownerId,
    });
  }

  const snapshot = await repository.getSnapshotForUser(snapshotId as string, ownerId);

  if (!snapshot) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    snapshot,
  });
}
