import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { applyAppSession, resolveAuthorizedMember, safeNext } from "@/lib/auth-session";
import { createClient, hasSupabaseAuthEnv } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", next);

  if (!hasSupabaseAuthEnv()) {
    loginUrl.searchParams.set("error", "supabase_auth_env_missing");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      loginUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(loginUrl);
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) {
      loginUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(loginUrl);
    }
  } else {
    loginUrl.searchParams.set("error", "missing_auth_token");
    return NextResponse.redirect(loginUrl);
  }

  const { data, error: userError } = await supabase.auth.getUser();
  const email = data.user?.email?.trim().toLowerCase() ?? "";
  const name = (data.user?.user_metadata?.full_name || data.user?.user_metadata?.name || email.split("@")[0] || "").toString();

  if (userError) {
    loginUrl.searchParams.set("error", userError.message);
    return NextResponse.redirect(loginUrl);
  }

  const authz = await resolveAuthorizedMember({ email, name });
  if (!authz.ok) {
    loginUrl.searchParams.set("error", authz.error);
    if ("email" in authz && authz.email) loginUrl.searchParams.set("email", authz.email);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.redirect(new URL(next, request.url));
  return applyAppSession(response, { email: authz.email, roleId: authz.member.roleId });
}
