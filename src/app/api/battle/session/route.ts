import { NextResponse } from "next/server";
import type { UserBattle } from "@/domain/models/UserBattle";
import { getBattleSettlementAt } from "@/application/useCases/fetchBattleSettlement";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";
import { FileBattleSnapshotRepository } from "@/infrastructure/db/fileBattleSnapshotRepository";
import { persistAuthenticatedBattleSession } from "@/infrastructure/db/supabaseBattlePersistence";

const allowedTeams = new Set<UserBattle["selectedTeam"]>(["bull", "bear"]);
const allowedTimeframes = new Set<UserBattle["timeframe"]>(["5m", "30m", "1h", "4h", "24h", "7d"]);

function isIsoDateString(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    userBattle?: UserBattle;
  };

  if (!body.userBattle) {
    return NextResponse.json({ error: "missing_user_battle" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (
    !body.userBattle.snapshotId ||
    !allowedTeams.has(body.userBattle.selectedTeam) ||
    !allowedTimeframes.has(body.userBattle.timeframe) ||
    !isIsoDateString(body.userBattle.selectedAt)
  ) {
    return NextResponse.json({ error: "invalid_user_battle" }, { status: 400 });
  }

  const snapshotRepository = new FileBattleSnapshotRepository();
  const snapshot = await snapshotRepository.getSnapshotForUser(body.userBattle.snapshotId, user.id);

  if (!snapshot) {
    return NextResponse.json({ error: "snapshot_not_found" }, { status: 404 });
  }

  if (snapshot.coinId !== body.userBattle.coinId) {
    return NextResponse.json({ error: "snapshot_coin_mismatch" }, { status: 409 });
  }

  const coinSymbol = snapshot.marketData?.symbol ?? body.userBattle.coinSymbol;
  const selectedPrice = snapshot.marketData?.currentPrice ?? body.userBattle.selectedPrice;
  const settlementAt = getBattleSettlementAt(
    body.userBattle.selectedAt,
    body.userBattle.timeframe,
  );
  const marketSymbol = `${coinSymbol}USDT`;

  if (
    body.userBattle.coinSymbol !== coinSymbol ||
    body.userBattle.selectedPrice !== selectedPrice ||
    body.userBattle.settlementAt !== settlementAt ||
    body.userBattle.marketSymbol !== marketSymbol
  ) {
    return NextResponse.json({ error: "user_battle_integrity_mismatch" }, { status: 409 });
  }

  await persistAuthenticatedBattleSession(supabase, user, {
    ...body.userBattle,
    coinSymbol,
    selectedPrice,
    settlementAt,
    priceSource: "bybit-linear",
    marketSymbol,
  });

  return NextResponse.json({ ok: true });
}
