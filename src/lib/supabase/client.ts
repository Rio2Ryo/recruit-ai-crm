import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAuthEnv } from "@/lib/supabase/env";

export function createClient() {
  const env = getSupabaseAuthEnv();
  if (!env) {
    throw new Error("Supabase Auth env is not configured");
  }

  return createBrowserClient(env.url, env.anonKey);
}
