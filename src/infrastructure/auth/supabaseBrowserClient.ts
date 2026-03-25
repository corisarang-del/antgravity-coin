"use client";

import { createBrowserClient } from "@supabase/ssr";
import { envConfig, hasSupabasePublicEnv } from "@/shared/constants/envConfig";

export function createSupabaseBrowserClient() {
  if (!hasSupabasePublicEnv) {
    throw new Error(
      "Supabase public env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return createBrowserClient(envConfig.supabaseUrl, envConfig.supabasePublishableKey);
}
