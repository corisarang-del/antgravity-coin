"use client";

import { createBrowserClient } from "@supabase/ssr";
import { envConfig } from "@/shared/constants/envConfig";

export function createSupabaseBrowserClient() {
  return createBrowserClient(envConfig.supabaseUrl, envConfig.supabasePublishableKey);
}
