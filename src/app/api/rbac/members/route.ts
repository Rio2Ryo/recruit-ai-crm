import { NextRequest, NextResponse } from "next/server";
import { deleteRecruitingMemberRole, getRecruitingMemberRoleByEmail, listRecruitingMemberRoles, updateRecruitingMemberRole, upsertRecruitingMemberRole } from "@/lib/rbac-members";
import { getRoleFromRequest, roleHasPermission } from "@/lib/rbac";

function forbidden(roleId: string) {
  return NextResponse.json({ ok: false, error: "forbidden", role: roleId }, { status: 403 });
}

function canManageMembers(request: NextRequest) {
  const role = getRoleFromRequest(request);
  return { role, allowed: roleHasPermission(role, "admin") };
}

export async function GET(request: NextRequest) {
  const { role, allowed } = canManageMembers(request);
  if (!allowed) return forbidden(role.id);

  const email = request.nextUrl.searchParams.get("email");
  if (email) {
    const member = await getRecruitingMemberRoleByEmail(email);
    return NextResponse.json({ ok: true, member, role: role.id });
  }

  const members = await listRecruitingMemberRoles();
  return NextResponse.json({ ok: true, members, role: role.id });
}

export async function POST(request: NextRequest) {
  const { role, allowed } = canManageMembers(request);
  if (!allowed) return forbidden(role.id);

  const input = await request.json().catch(() => ({}));
  try {
    const member = await upsertRecruitingMemberRole({
      name: typeof input.name === "string" ? input.name : null,
      email: typeof input.email === "string" ? input.email : "",
      roleId: typeof input.roleId === "string" ? input.roleId : "interviewer",
      active: typeof input.active === "boolean" ? input.active : true,
    });
    return NextResponse.json({ ok: true, member });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "invalid request" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const { role, allowed } = canManageMembers(request);
  if (!allowed) return forbidden(role.id);

  const input = await request.json().catch(() => ({}));
  try {
    const member = await updateRecruitingMemberRole({
      id: typeof input.id === "string" ? input.id : "",
      name: typeof input.name === "string" ? input.name : undefined,
      roleId: typeof input.roleId === "string" ? input.roleId : undefined,
      active: typeof input.active === "boolean" ? input.active : undefined,
    });
    return NextResponse.json({ ok: true, member });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "invalid request" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { role, allowed } = canManageMembers(request);
  if (!allowed) return forbidden(role.id);

  const id = request.nextUrl.searchParams.get("id") ?? "";
  try {
    await deleteRecruitingMemberRole(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "invalid request" }, { status: 400 });
  }
}
