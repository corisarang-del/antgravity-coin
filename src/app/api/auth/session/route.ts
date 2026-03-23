import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";
import { getOrCreateGuestUserId } from "@/infrastructure/auth/guestSession";

export async function GET() {
  const guestUserId = await getOrCreateGuestUserId();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      user: null,
      isAuthenticated: false,
      guestUserId,
    });
  }

  const providers =
    Array.isArray(user.app_metadata?.providers) && user.app_metadata.providers.length > 0
      ? user.app_metadata.providers
      : user.app_metadata?.provider
        ? [user.app_metadata.provider]
        : [];

  return NextResponse.json({
    user: {
      userId: user.id,
      email: user.email ?? "",
      name:
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        (user.email?.split("@")[0] ?? "사용자"),
      image:
        (user.user_metadata?.avatar_url as string | undefined) ||
        (user.user_metadata?.picture as string | undefined) ||
        "",
      providerHints: providers,
    },
    isAuthenticated: true,
    guestUserId,
  });
}
