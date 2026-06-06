import { NextRequest, NextResponse } from "next/server";
import { createClient, hasSupabaseAuthEnv } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  if (!hasSupabaseAuthEnv()) {
    return NextResponse.json(
      { ok: false, error: "supabase_auth_env_missing", message: "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。" },
      { status: 503 }
    );
  }

  const next = request.nextUrl.searchParams.get("next") || "/dashboard";
  const callbackUrl = new URL("/api/auth/callback", request.url);
  callbackUrl.searchParams.set("next", next);

  const supabase = await createClient();
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
    loginUrl.searchParams.set("error", error?.message || "google_oauth_failed");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(data.url);
}
