import { NextRequest, NextResponse } from "next/server";
import { recordLineAction, saveLineApplicant } from "@/lib/line-applicant-store";

export async function POST(request: NextRequest) {
  const input = (await request.json().catch(() => ({}))) as {
    lineUserId?: string;
    friendId?: string;
    type?: "form_view" | "message" | "postback";
    label?: string;
    detail?: Record<string, unknown>;
  };

  const lineUserId = input.lineUserId || "anonymous-line-user";
  const applicant = await saveLineApplicant({ lineUserId, friendId: input.friendId, currentStage: "LINE流入", step: "welcome" });
  const event = await recordLineAction({
    applicantId: applicant.id,
    lineUserId,
    friendId: input.friendId,
    type: input.type ?? "form_view",
    label: input.label ?? "応募フォーム表示",
    detail: input.detail,
  });

  return NextResponse.json({ ok: true, event });
}
