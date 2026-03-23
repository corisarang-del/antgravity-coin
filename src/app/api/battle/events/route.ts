import { NextResponse } from "next/server";
import { getRequestOwnerId } from "@/infrastructure/auth/requestOwner";
import { FileBattleSnapshotRepository } from "@/infrastructure/db/fileBattleSnapshotRepository";
import { FileEventLog } from "@/infrastructure/db/fileEventLog";

export async function GET(request: Request) {
  const battleId = new URL(request.url).searchParams.get("battleId");

  if (!battleId) {
    return NextResponse.json({ error: "missing_battle_id" }, { status: 400 });
  }

  const { ownerId } = await getRequestOwnerId();
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
