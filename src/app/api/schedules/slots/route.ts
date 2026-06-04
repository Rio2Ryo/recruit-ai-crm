import { NextRequest, NextResponse } from "next/server";
import { createScheduleSlot, updateScheduleSlotStatus } from "@/lib/scheduling";
import { getRoleFromRequest, roleHasPermission } from "@/lib/rbac";

export async function POST(request: NextRequest) {
  const role = getRoleFromRequest(request);
  if (!roleHasPermission(role, "schedule:manage")) {
    return NextResponse.json({ ok: false, error: "forbidden", role: role.id }, { status: 403 });
  }

  const input = await request.json().catch(() => ({}));
  const slot = await createScheduleSlot(input);
  if (!slot) {
    return NextResponse.json({ ok: false, error: "event not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, role: role.id, slot });
}

export async function PATCH(request: NextRequest) {
  const role = getRoleFromRequest(request);
  if (!roleHasPermission(role, "schedule:manage")) {
    return NextResponse.json({ ok: false, error: "forbidden", role: role.id }, { status: 403 });
  }

  const input = await request.json().catch(() => ({}));
  const slot = await updateScheduleSlotStatus(input);
  if (!slot) return NextResponse.json({ ok: false, error: "slot not found" }, { status: 404 });
  return NextResponse.json({ ok: true, role: role.id, slot });
}
