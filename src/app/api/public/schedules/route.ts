import { NextRequest, NextResponse } from "next/server";
import { createPublicScheduleBooking, listPublicScheduleEvents } from "@/lib/scheduling";

export async function GET() {
  const events = await listPublicScheduleEvents();
  return NextResponse.json({ ok: true, events });
}

export async function POST(request: NextRequest) {
  const input = await request.json().catch(() => ({}));
  const booking = await createPublicScheduleBooking(input);
  if (!booking) return NextResponse.json({ ok: false, error: "slot not found" }, { status: 404 });
  if ("error" in booking) {
    const status = booking.error === "applicantName is required" ? 400 : 409;
    return NextResponse.json({ ok: false, error: booking.error }, { status });
  }
  return NextResponse.json({ ok: true, booking });
}
