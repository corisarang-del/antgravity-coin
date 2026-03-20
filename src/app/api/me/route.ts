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

  const [{ data: profile }, { data: progress }] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_progress").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  return NextResponse.json({
    ok: true,
    user: {
      userId: user.id,
      email: user.email ?? "",
      name:
        profile?.display_name ||
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        (user.email?.split("@")[0] ?? "사용자"),
      image:
        profile?.avatar_url ||
        (user.user_metadata?.avatar_url as string | undefined) ||
        (user.user_metadata?.picture as string | undefined) ||
        "",
      providerHints:
        (Array.isArray(user.app_metadata?.providers) && user.app_metadata.providers) ||
        (user.app_metadata?.provider ? [user.app_metadata.provider] : []),
    },
    progress:
      progress ?? {
        level: 1,
        title: "개미",
        xp: 0,
        wins: 0,
        losses: 0,
      },
  });
}
