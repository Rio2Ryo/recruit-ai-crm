import { NextRequest, NextResponse } from "next/server";
import { createScheduleEvent, deleteScheduleEvent, listScheduleEvents } from "@/lib/scheduling";
import { getRoleFromRequest, roleHasPermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  const role = getRoleFromRequest(request);
  if (!roleHasPermission(role, "schedule:view")) {
    return NextResponse.json({ ok: false, error: "forbidden", role: role.id }, { status: 403 });
  }

  return NextResponse.json({ ok: true, role: role.id, events: await listScheduleEvents() });
}

export async function POST(request: NextRequest) {
  const sessionEmail = request.cookies.get("recruit-ai-session-email")?.value?.trim();
  if (!sessionEmail) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const role = getRoleFromRequest(request);
  if (!roleHasPermission(role, "schedule:manage")) {
    return NextResponse.json({ ok: false, error: "forbidden", role: role.id }, { status: 403 });
  }

  const input = await request.json().catch(() => ({}));
  const event = await createScheduleEvent(input);
  return NextResponse.json({ ok: true, role: role.id, event });
}

export async function DELETE(request: NextRequest) {
  const sessionEmail = request.cookies.get("recruit-ai-session-email")?.value?.trim();
  if (!sessionEmail) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const role = getRoleFromRequest(request);
  if (!roleHasPermission(role, "schedule:manage")) {
    return NextResponse.json({ ok: false, error: "forbidden", role: role.id }, { status: 403 });
  }

  const eventId = request.nextUrl.searchParams.get("eventId");
  const deleted = await deleteScheduleEvent(eventId ?? undefined);
  if (!deleted) return NextResponse.json({ ok: false, error: "event not found" }, { status: 404 });
  return NextResponse.json({ ok: true, role: role.id, deleted: true, eventId });
}
