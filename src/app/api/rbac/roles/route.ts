import { NextRequest, NextResponse } from "next/server";
import { getRoleFromRequest, permissionGroups, roleDefinitions } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  const currentRole = getRoleFromRequest(request);
  return NextResponse.json({
    ok: true,
    currentRole,
    roles: roleDefinitions,
    permissionGroups,
  });
}
