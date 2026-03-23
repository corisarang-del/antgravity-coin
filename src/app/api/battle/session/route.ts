import { NextResponse } from "next/server";
import type { UserBattle } from "@/domain/models/UserBattle";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";
import { persistAuthenticatedBattleSession } from "@/infrastructure/db/supabaseBattlePersistence";

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
    return NextResponse.json({ ok: false, skipped: "unauthenticated" });
  }

  await persistAuthenticatedBattleSession(supabase, user, body.userBattle);

  return NextResponse.json({ ok: true });
}
