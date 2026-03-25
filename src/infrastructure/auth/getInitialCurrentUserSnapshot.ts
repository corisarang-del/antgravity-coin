import type { User } from "@supabase/supabase-js";
import { getGuestUserId } from "@/infrastructure/auth/guestSession";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";
import type { CurrentUserSnapshot } from "@/presentation/hooks/currentUserStore";
import { hasSupabasePublicEnv } from "@/shared/constants/envConfig";

export function createCurrentUserSnapshot(input: {
  user: User | null;
  guestUserId: string | null;
}): CurrentUserSnapshot {
  const { user, guestUserId } = input;

  if (!user) {
    return {
      user: null,
      guestUserId,
      isAuthenticated: false,
      isLoading: false,
    };
  }

  const providerHints =
    Array.isArray(user.app_metadata?.providers) && user.app_metadata.providers.length > 0
      ? user.app_metadata.providers
      : user.app_metadata?.provider
        ? [user.app_metadata.provider]
        : [];

  return {
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
      providerHints,
    },
    guestUserId,
    isAuthenticated: true,
    isLoading: false,
  };
}

export async function getInitialCurrentUserSnapshot(): Promise<CurrentUserSnapshot> {
  const guestUserId = await getGuestUserId();

  if (!hasSupabasePublicEnv) {
    return createCurrentUserSnapshot({ user: null, guestUserId });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return createCurrentUserSnapshot({ user, guestUserId });
}
