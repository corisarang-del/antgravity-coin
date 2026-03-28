import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";
import { normalizeUserLevel } from "@/infrastructure/mappers/levelMapper";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data } = await supabase.from("user_progress").select("*").eq("user_id", user.id).maybeSingle();

  return NextResponse.json({
    ok: true,
    progress: normalizeUserLevel(data),
  });
}
