import { NextResponse } from "next/server";
import { listRecruitingMemberRoles, upsertRecruitingMemberRole } from "@/lib/rbac-members";

export const SESSION_COOKIE = "recruit-ai-session-email";
export const SESSION_ROLE_COOKIE = "recruit-ai-session-role";

export function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function resolveAuthorizedMember(input: { email: string; name?: string | null }) {
  const email = input.email.trim().toLowerCase();
  const name = input.name?.trim() || email.split("@")[0] || null;
  if (!email) return { ok: false as const, error: "auth_email_not_found" };

  const members = await listRecruitingMemberRoles();
  let member = members.find((item) => item.email === email) ?? null;

  if (!member && members.length === 0) {
    member = await upsertRecruitingMemberRole({ email, name, roleId: "executive", active: true });
  }

  if (!member) return { ok: false as const, error: "member_role_is_not_assigned", email };
  if (!member.active) return { ok: false as const, error: "member_is_disabled", email };

  return { ok: true as const, email, member };
}

export async function ensureMemberCanLogin(emailInput: string) {
  const email = emailInput.trim().toLowerCase();
  if (!email) return { ok: false as const, error: "email_required" };

  const members = await listRecruitingMemberRoles();
  if (members.length === 0) {
    const member = await upsertRecruitingMemberRole({ email, name: email.split("@")[0], roleId: "executive", active: true });
    return { ok: true as const, email, member };
  }

  const member = members.find((item) => item.email === email) ?? null;
  if (!member) return { ok: false as const, error: "member_role_is_not_assigned", email };
  if (!member.active) return { ok: false as const, error: "member_is_disabled", email };
  return { ok: true as const, email, member };
}

export function applyAppSession(response: NextResponse, input: { email: string; roleId: string }) {
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };

  response.cookies.set(SESSION_COOKIE, input.email, cookieOptions);
  response.cookies.set(SESSION_ROLE_COOKIE, input.roleId, cookieOptions);
  return response;
}
