import { NextRequest, NextResponse } from "next/server";
import { listLineApplicants } from "@/lib/line-applicant-store";
import { cancelScheduledLineMessage, listScheduledLineMessages, scheduleLineMessage } from "@/lib/line-scheduler";

export async function GET() {
  return NextResponse.json({ ok: true, schedules: await listScheduledLineMessages() });
}

export async function POST(request: NextRequest) {
  // UI demo phase: the settings page auth is currently bypassed by middleware,
  // so requiring a separate hidden admin key here makes the intuitive reservation UI unusable.
  // Restore API-level admin-key enforcement together with real dashboard auth.
  const input = (await request.json().catch(() => ({}))) as {
    applicantId?: string;
    targetMode?: "individual" | "job" | "all";
    jobTitle?: string;
    sendAt?: string;
    text?: string;
    title?: string;
  };

  const applicants = await listLineApplicants();
  const targetMode = input.targetMode ?? "individual";
  const targets = targetMode === "all"
    ? applicants
    : targetMode === "job"
      ? applicants.filter((item) => (item.jobTitle ?? "希望職種未定") === input.jobTitle)
      : applicants.filter((item) => item.id === input.applicantId);

  if (targets.length === 0) {
    return NextResponse.json({ ok: false, error: targetMode === "job" ? "job targets are required" : "applicant is required" }, { status: 400 });
  }

  if (!input.sendAt || Number.isNaN(Date.parse(input.sendAt))) {
    return NextResponse.json({ ok: false, error: "valid sendAt is required" }, { status: 400 });
  }

  if (!input.text?.trim()) {
    return NextResponse.json({ ok: false, error: "text is required" }, { status: 400 });
  }

  const scheduled = await Promise.all(targets.map((applicant) => scheduleLineMessage({
      applicantId: applicant.id,
      lineUserId: applicant.lineUserId,
      friendId: applicant.friendId,
      title: input.title?.trim() || "メッセージ予約",
      text: input.text!.trim(),
      stage: applicant.currentStage,
      scheduledFor: new Date(input.sendAt!).toISOString(),
    })));

  return NextResponse.json({ ok: true, scheduled, count: scheduled.length });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });

  const scheduled = await cancelScheduledLineMessage(id);
  if (!scheduled) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  return NextResponse.json({ ok: true, scheduled });
}
