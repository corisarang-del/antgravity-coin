import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";

interface BattleDetailRouteProps {
  params: Promise<{
    battleId: string;
  }>;
}

export async function GET(_: Request, { params }: BattleDetailRouteProps) {
  const { battleId } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("battle_sessions")
    .select(
      `
      *,
      battle_outcomes (*),
      battle_snapshots (*),
      player_decision_seeds (*),
      character_memory_seeds (*)
    `,
    )
    .eq("owner_user_id", user.id)
    .eq("battle_id", battleId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "battle_detail_query_failed" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    battle: data,
  });
}
