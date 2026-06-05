import { NextRequest, NextResponse } from "next/server";
import { deleteRecruitingMemberRole, getRecruitingMemberRoleByEmail, listRecruitingMemberRoles, updateRecruitingMemberRole, upsertRecruitingMemberRole } from "@/lib/rbac-members";
import { hasPermission } from "@/lib/rbac";

const SESSION_COOKIE = "recruit-ai-session-email";

function forbidden(roleId: string) {
  return NextResponse.json({ ok: false, error: "forbidden", role: roleId }, { status: 403 });
}

async function getLoggedInMember(request: NextRequest) {
  const email = request.cookies.get(SESSION_COOKIE)?.value?.trim().toLowerCase() ?? "";
  if (!email) return null;
  const member = await getRecruitingMemberRoleByEmail(email);
  if (!member?.active) return null;
  return member;
}

async function canManageMembers(request: NextRequest) {
  const member = await getLoggedInMember(request);
  const roleId = member?.roleId ?? "guest";
  return { member, roleId, allowed: member ? hasPermission(member.roleId, "admin") : false };
}

export async function GET(request: NextRequest) {
  const { member, roleId, allowed } = await canManageMembers(request);
  if (!member || !allowed) return forbidden(roleId);

  const email = request.nextUrl.searchParams.get("email");
  if (email) {
    const targetMember = await getRecruitingMemberRoleByEmail(email);
    return NextResponse.json({ ok: true, member: targetMember, role: member.roleId });
  }

  const members = await listRecruitingMemberRoles();
  return NextResponse.json({ ok: true, members, role: member.roleId });
}

export async function POST(request: NextRequest) {
  const { member, roleId, allowed } = await canManageMembers(request);
  if (!member || !allowed) return forbidden(roleId);

  const input = await request.json().catch(() => ({}));
  try {
    const targetMember = await upsertRecruitingMemberRole({
      name: typeof input.name === "string" ? input.name : null,
      email: typeof input.email === "string" ? input.email : "",
      roleId: typeof input.roleId === "string" ? input.roleId : "interviewer",
      active: typeof input.active === "boolean" ? input.active : true,
    });
    return NextResponse.json({ ok: true, member: targetMember });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "invalid request" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const { member, roleId, allowed } = await canManageMembers(request);
  if (!member || !allowed) return forbidden(roleId);

  const input = await request.json().catch(() => ({}));
  try {
    const targetMember = await updateRecruitingMemberRole({
      id: typeof input.id === "string" ? input.id : "",
      name: typeof input.name === "string" ? input.name : undefined,
      roleId: typeof input.roleId === "string" ? input.roleId : undefined,
      active: typeof input.active === "boolean" ? input.active : undefined,
    });
    return NextResponse.json({ ok: true, member: targetMember });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { member, roleId, allowed } = await canManageMembers(request);
  if (!member || !allowed) return forbidden(roleId);

  const id = request.nextUrl.searchParams.get("id") ?? "";
  try {
    await deleteRecruitingMemberRole(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "invalid request" }, { status: 400 });
  }
}
