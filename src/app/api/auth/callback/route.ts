import { NextRequest, NextResponse } from "next/server";
import { createClient, hasSupabaseAuthEnv } from "@/lib/supabase/server";
import { listRecruitingMemberRoles, upsertRecruitingMemberRole } from "@/lib/rbac-members";

const SESSION_COOKIE = "recruit-ai-session-email";
const SESSION_ROLE_COOKIE = "recruit-ai-session-role";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", next);

  if (!hasSupabaseAuthEnv()) {
    loginUrl.searchParams.set("error", "supabase_auth_env_missing");
    return NextResponse.redirect(loginUrl);
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    loginUrl.searchParams.set("error", "missing_oauth_code");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    loginUrl.searchParams.set("error", exchangeError.message);
    return NextResponse.redirect(loginUrl);
  }

  const { data, error: userError } = await supabase.auth.getUser();
  const email = data.user?.email?.trim().toLowerCase() ?? "";
  const name = (data.user?.user_metadata?.full_name || data.user?.user_metadata?.name || email.split("@")[0] || "").toString();

  if (userError || !email) {
    loginUrl.searchParams.set("error", userError?.message || "google_email_not_found");
    return NextResponse.redirect(loginUrl);
  }

  const members = await listRecruitingMemberRoles();
  let member = members.find((item) => item.email === email) ?? null;

  if (!member && members.length === 0) {
    member = await upsertRecruitingMemberRole({ email, name, roleId: "executive", active: true });
  }

  if (!member) {
    loginUrl.searchParams.set("error", "member_role_is_not_assigned");
    loginUrl.searchParams.set("email", email);
    return NextResponse.redirect(loginUrl);
  }

  if (!member.active) {
    loginUrl.searchParams.set("error", "member_is_disabled");
    loginUrl.searchParams.set("email", email);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.redirect(new URL(next, request.url));
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
  response.cookies.set(SESSION_COOKIE, email, cookieOptions);
  response.cookies.set(SESSION_ROLE_COOKIE, member.roleId, cookieOptions);
  return response;
}
