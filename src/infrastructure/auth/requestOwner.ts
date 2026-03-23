import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";
import { getOrCreateGuestUserId } from "@/infrastructure/auth/guestSession";

export async function getRequestOwnerId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return {
      ownerId: user.id,
      isAuthenticated: true,
      user,
      supabase,
    };
  }

  return {
    ownerId: await getOrCreateGuestUserId(),
    isAuthenticated: false,
    user: null,
    supabase,
  };
}
