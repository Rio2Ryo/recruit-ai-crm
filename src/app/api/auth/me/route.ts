import { NextRequest, NextResponse } from "next/server";
import { getRecruitingMemberRoleByEmail } from "@/lib/rbac-members";

const SESSION_COOKIE = "recruit-ai-session-email";
const SESSION_ROLE_COOKIE = "recruit-ai-session-role";

export async function GET(request: NextRequest) {
  const email = request.cookies.get(SESSION_COOKIE)?.value?.trim().toLowerCase() ?? "";
  if (!email) return NextResponse.json({ ok: true, authenticated: false, member: null });

  const member = await getRecruitingMemberRoleByEmail(email);
  if (!member || !member.active) {
    const response = NextResponse.json({ ok: true, authenticated: false, member: null });
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
    response.cookies.set(SESSION_ROLE_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
    return response;
  }

  const response = NextResponse.json({ ok: true, authenticated: true, member });
  response.cookies.set(SESSION_ROLE_COOKIE, member.roleId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
