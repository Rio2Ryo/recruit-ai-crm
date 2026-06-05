import { NextResponse } from "next/server";
import { listRecruitingMemberRoles, upsertRecruitingMemberRole } from "@/lib/rbac-members";

const SESSION_COOKIE = "recruit-ai-session-email";

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function POST(request: Request) {
  const input = await request.json().catch(() => ({}));
  const email = normalizeEmail(input.email);
  const name = typeof input.name === "string" ? input.name.trim() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "valid email is required" }, { status: 400 });
  }

  const members = await listRecruitingMemberRoles();
  let member = members.find((item) => item.email === email) ?? null;

  if (!member && members.length === 0) {
    member = await upsertRecruitingMemberRole({
      email,
      name: name || email.split("@")[0],
      roleId: "executive",
      active: true,
    });
  }

  if (!member) {
    return NextResponse.json({ ok: false, error: "member role is not assigned" }, { status: 403 });
  }

  if (!member.active) {
    return NextResponse.json({ ok: false, error: "member is disabled" }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true, member });
  response.cookies.set(SESSION_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
