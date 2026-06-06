import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAuthEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get("next") || "/dashboard";

  const env = getSupabaseAuthEnv();
  if (!env) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", next);
    loginUrl.searchParams.set("error", "supabase_auth_env_missing");
    return NextResponse.redirect(loginUrl);
  }

  const { createServerClient } = await import("@supabase/ssr");
  const callbackUrl = new URL("/api/auth/callback", request.url);
  callbackUrl.searchParams.set("next", next);

  const response = NextResponse.next();
  const supabase = createServerClient(
    env.url,
    env.anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", next);
    loginUrl.searchParams.set("error", error?.message || "google_oauth_failed");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(data.url);
}
