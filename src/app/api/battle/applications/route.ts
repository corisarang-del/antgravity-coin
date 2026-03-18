import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { FileBattleResultApplicationRepository } from "@/infrastructure/db/fileBattleResultApplicationRepository";

const SESSION_COOKIE_NAME = "ant_gravity_user_id";

async function getSessionUserId() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function GET(request: Request) {
  const userId = await getSessionUserId();
  const battleId = new URL(request.url).searchParams.get("battleId");

  if (!userId || !battleId) {
    return NextResponse.json({ error: "missing_session_or_battle_id" }, { status: 400 });
  }

  const repository = new FileBattleResultApplicationRepository();
  const applied = await repository.hasApplied(battleId, userId);

  return NextResponse.json({ applied, userId });
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  const body = (await request.json()) as {
    battleId?: string;
  };

  if (!userId || !body.battleId) {
    return NextResponse.json({ error: "missing_session_or_battle_id" }, { status: 400 });
  }

  const repository = new FileBattleResultApplicationRepository();
  await repository.markApplied({
    battleId: body.battleId,
    userId,
    appliedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, userId });
}
