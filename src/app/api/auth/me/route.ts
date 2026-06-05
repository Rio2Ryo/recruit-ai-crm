import { NextRequest, NextResponse } from "next/server";
import { getRecruitingMemberRoleByEmail } from "@/lib/rbac-members";

const SESSION_COOKIE = "recruit-ai-session-email";

export async function GET(request: NextRequest) {
  const email = request.cookies.get(SESSION_COOKIE)?.value?.trim().toLowerCase() ?? "";
  if (!email) return NextResponse.json({ ok: true, authenticated: false, member: null });

  const member = await getRecruitingMemberRoleByEmail(email);
  if (!member || !member.active) {
    return NextResponse.json({ ok: true, authenticated: false, member: null });
  }

  return NextResponse.json({ ok: true, authenticated: true, member });
}
