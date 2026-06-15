import { NextRequest, NextResponse } from "next/server";
import { getRoleFromRequest, permissionGroups, roleDefinitions } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  const sessionEmail = request.cookies.get("recruit-ai-session-email")?.value?.trim();
  if (!sessionEmail) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const currentRole = getRoleFromRequest(request);
  return NextResponse.json({
    ok: true,
    currentRole,
    roles: roleDefinitions,
    permissionGroups,
  });
}
