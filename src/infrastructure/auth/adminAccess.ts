import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";

interface AdminAccessResult {
  allowed: boolean;
  status: 200 | 401 | 403;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  user: User | null;
}

function parseAdminUserIds() {
  return new Set(
    (process.env.ADMIN_USER_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function isAdminUser(user: User, profileIsAdmin: boolean) {
  return (
    profileIsAdmin ||
    user.app_metadata?.role === "admin" ||
    user.app_metadata?.is_admin === true ||
    parseAdminUserIds().has(user.id)
  );
}

export async function getAdminAccess(): Promise<AdminAccessResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      allowed: false,
      status: 401,
      supabase,
      user: null,
    };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  const allowed = isAdminUser(user, profile?.is_admin === true);

  return {
    allowed,
    status: allowed ? 200 : 403,
    supabase,
    user,
  };
}
