import { NextResponse } from "next/server";
import { createClient, hasSupabaseAuthEnv } from "@/lib/supabase/server";

const SESSION_COOKIE = "recruit-ai-session-email";
const SESSION_ROLE_COOKIE = "recruit-ai-session-role";

export async function POST() {
  if (hasSupabaseAuthEnv()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // Cookie cleanup below is enough for app logout.
    }
  }

  const response = NextResponse.json({ ok: true });
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
  response.cookies.set(SESSION_COOKIE, "", cookieOptions);
  response.cookies.set(SESSION_ROLE_COOKIE, "", cookieOptions);
  return response;
}
