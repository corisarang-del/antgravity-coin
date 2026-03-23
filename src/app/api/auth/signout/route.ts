import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
