import { NextRequest, NextResponse } from "next/server";
import { createScheduleEvent, listScheduleEvents } from "@/lib/scheduling";
import { getRoleFromRequest, roleHasPermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  const role = getRoleFromRequest(request);
  if (!roleHasPermission(role, "schedule:view")) {
    return NextResponse.json({ ok: false, error: "forbidden", role: role.id }, { status: 403 });
  }

  return NextResponse.json({ ok: true, role: role.id, events: await listScheduleEvents() });
}

export async function POST(request: NextRequest) {
  const role = getRoleFromRequest(request);
  if (!roleHasPermission(role, "schedule:manage")) {
    return NextResponse.json({ ok: false, error: "forbidden", role: role.id }, { status: 403 });
  }

  const input = await request.json().catch(() => ({}));
  const event = await createScheduleEvent(input);
  return NextResponse.json({ ok: true, role: role.id, event });
}
