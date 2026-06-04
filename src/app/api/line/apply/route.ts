import { NextRequest, NextResponse } from "next/server";
import { recordLineAction, saveLineApplicant } from "@/lib/line-applicant-store";
import { scheduleRuleMessagesForApplicant } from "@/lib/line-scheduler";
import { sendLineMessageForApplicant } from "@/lib/line-workflow";

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL ?? `${request.nextUrl.protocol}//${request.nextUrl.host}`;
}

export async function POST(request: NextRequest) {
  const input = await request.json();
  const applicant = await saveLineApplicant({
    lineUserId: input.lineUserId || "demo-line-user",
    friendId: input.friendId,
    name: input.name,
    school: input.school,
    department: input.department,
    phone: input.phone,
    email: input.email,
    jobId: input.jobId,
    selfPr: input.selfPr,
    currentStage: "応募",
  });

  await recordLineAction({
    applicantId: applicant.id,
    lineUserId: applicant.lineUserId,
    friendId: applicant.friendId,
    type: "form_submit",
    label: "LINE応募フォーム送信",
    detail: { jobId: input.jobId, school: input.school, department: input.department },
  });

  const messageResult = await sendLineMessageForApplicant(
    applicant,
    `${applicant.name ?? "応募者"}さん、応募を受け付けました。\n担当者が確認後、面接・見学の日程をこのLINEでご連絡します。`,
    "auto",
    { templateId: "apply-thanks", stage: "応募" }
  );

  const schedules = await scheduleRuleMessagesForApplicant(getBaseUrl(request), applicant, "応募");

  return NextResponse.json({ ok: true, applicant, messageResult, schedules, baseUrl: getBaseUrl(request) });
}
