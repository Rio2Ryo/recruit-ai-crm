import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAuthEnv, hasSupabaseAuthEnv } from "@/lib/supabase/env";

export { hasSupabaseAuthEnv };

export async function createClient() {
  const cookieStore = await cookies();

  const env = getSupabaseAuthEnv();
  if (!env) {
    throw new Error("Supabase Auth env is not configured");
  }

  return createServerClient(
    env.url,
    env.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — ignore
          }
        },
      },
    }
  );
}
