import { NextResponse } from "next/server";
import { FileEventLog } from "@/infrastructure/db/fileEventLog";

export async function GET(request: Request) {
  const battleId = new URL(request.url).searchParams.get("battleId");

  if (!battleId) {
    return NextResponse.json({ error: "missing_battle_id" }, { status: 400 });
  }

  const eventLog = new FileEventLog();
  const events = await eventLog.listByBattleId(battleId);

  return NextResponse.json({
    ok: true,
    events,
  });
}
