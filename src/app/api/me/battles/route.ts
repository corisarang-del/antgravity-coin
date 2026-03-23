import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";

export async function GET() {
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
      battle_id,
      coin_id,
      coin_symbol,
      selected_team,
      timeframe,
      selected_price,
      selected_at,
      settlement_at,
      market_symbol,
      status,
      settled_price,
      battle_outcomes (
        winning_team,
        price_change_percent,
        user_won,
        report_json
      )
    `,
    )
    .eq("owner_user_id", user.id)
    .order("selected_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "battle_query_failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    battles: data ?? [],
  });
}
