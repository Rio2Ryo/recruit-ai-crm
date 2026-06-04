import { NextRequest, NextResponse } from "next/server";
import { createScheduleSlot } from "@/lib/scheduling";
import { getRoleFromRequest, roleHasPermission } from "@/lib/rbac";

export async function POST(request: NextRequest) {
  const role = getRoleFromRequest(request);
  if (!roleHasPermission(role, "schedule:manage")) {
    return NextResponse.json({ ok: false, error: "forbidden", role: role.id }, { status: 403 });
  }

  const input = await request.json().catch(() => ({}));
  const slot = createScheduleSlot(input);
  if (!slot) {
    return NextResponse.json({ ok: false, error: "event not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, role: role.id, slot });
}
