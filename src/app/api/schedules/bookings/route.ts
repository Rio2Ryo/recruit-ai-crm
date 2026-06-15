import { NextRequest, NextResponse } from "next/server";
import { createScheduleBooking, listScheduleEvents, updateScheduleBookingStatus, type ScheduleEvent } from "@/lib/scheduling";
import { getRoleFromRequest, roleHasPermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  const role = getRoleFromRequest(request);
  if (!roleHasPermission(role, "schedule:view")) {
    return NextResponse.json({ ok: false, error: "forbidden", role: role.id }, { status: 403 });
  }

  const bookings = (await listScheduleEvents()).flatMap((event: ScheduleEvent) =>
    event.slots.flatMap((slot) =>
      slot.bookings.map((booking) => ({
        ...booking,
        eventTitle: event.title,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
      }))
    )
  );

  return NextResponse.json({ ok: true, role: role.id, bookings });
}

export async function POST(request: NextRequest) {
  const sessionEmail = request.cookies.get("recruit-ai-session-email")?.value?.trim();
  if (!sessionEmail) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const role = getRoleFromRequest(request);
  if (!roleHasPermission(role, "schedule:book") && !roleHasPermission(role, "schedule:manage")) {
    return NextResponse.json({ ok: false, error: "forbidden", role: role.id }, { status: 403 });
  }

  const input = await request.json().catch(() => ({}));
  const booking = await createScheduleBooking(input);
  if (!booking) {
    return NextResponse.json({ ok: false, error: "slot not found" }, { status: 404 });
  }
  if ("error" in booking) {
    return NextResponse.json({ ok: false, error: booking.error }, { status: 409 });
  }

  return NextResponse.json({ ok: true, role: role.id, booking });
}

export async function PATCH(request: NextRequest) {
  const sessionEmail = request.cookies.get("recruit-ai-session-email")?.value?.trim();
  if (!sessionEmail) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const role = getRoleFromRequest(request);
  if (!roleHasPermission(role, "schedule:book") && !roleHasPermission(role, "schedule:manage")) {
    return NextResponse.json({ ok: false, error: "forbidden", role: role.id }, { status: 403 });
  }

  const input = await request.json().catch(() => ({}));
  const booking = await updateScheduleBookingStatus(input);
  if (!booking) return NextResponse.json({ ok: false, error: "booking not found" }, { status: 404 });
  return NextResponse.json({ ok: true, role: role.id, booking });
}
