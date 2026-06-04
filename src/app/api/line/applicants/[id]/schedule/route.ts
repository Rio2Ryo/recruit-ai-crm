import { NextRequest, NextResponse } from "next/server";
import { listLineApplicants } from "@/lib/line-applicant-store";
import { scheduleLineMessage } from "@/lib/line-scheduler";

function isAuthorized(request: NextRequest) {
  const adminKey = process.env.LINE_CLI_ADMIN_KEY ?? process.env.LINE_SETTINGS_ADMIN_KEY;
  if (!adminKey) return true;
  return request.headers.get("x-admin-key") === adminKey;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const input = (await request.json().catch(() => ({}))) as {
    sendAt?: string;
    text?: string;
    templateId?: string;
    title?: string;
  };
  const applicant = (await listLineApplicants()).find((item) => item.id === id);

  if (!applicant) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  if (!input.sendAt || Number.isNaN(Date.parse(input.sendAt))) {
    return NextResponse.json({ ok: false, error: "valid sendAt is required" }, { status: 400 });
  }

  if (!input.text?.trim() && !input.templateId) {
    return NextResponse.json({ ok: false, error: "text or templateId is required" }, { status: 400 });
  }

  const scheduled = await scheduleLineMessage({
    applicantId: applicant.id,
    lineUserId: applicant.lineUserId,
    friendId: applicant.friendId,
    title: input.title?.trim() || "個別予約送信",
    text: input.text?.trim(),
    templateId: input.templateId?.trim(),
    stage: applicant.currentStage,
    scheduledFor: new Date(input.sendAt).toISOString(),
  });

  return NextResponse.json({ ok: true, scheduled });
}
