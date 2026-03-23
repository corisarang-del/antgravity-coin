import { NextResponse } from "next/server";
import { getRequestOwnerId } from "@/infrastructure/auth/requestOwner";
import { FileBattleResultApplicationRepository } from "@/infrastructure/db/fileBattleResultApplicationRepository";

export async function GET(request: Request) {
  const { ownerId: userId } = await getRequestOwnerId();
  const battleId = new URL(request.url).searchParams.get("battleId");

  if (!battleId) {
    return NextResponse.json({ error: "missing_battle_id" }, { status: 400 });
  }

  const repository = new FileBattleResultApplicationRepository();
  const applied = await repository.hasApplied(battleId, userId);

  return NextResponse.json({ applied, userId });
}

export async function POST(request: Request) {
  const { ownerId: userId } = await getRequestOwnerId();
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
