import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { envConfig } from "@/shared/constants/envConfig";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(envConfig.supabaseUrl, envConfig.supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component에서 set이 막히는 경우는 middleware/proxy가 세션을 갱신하게 둔다.
        }
      },
    },
  });
}
