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

  const scheduleUrl = `${getBaseUrl(request)}/schedule?lineUserId=${encodeURIComponent(applicant.lineUserId)}&applicantId=${encodeURIComponent(applicant.id)}${applicant.name ? `&name=${encodeURIComponent(applicant.name)}` : ""}`;

  const messageResult = await sendLineMessageForApplicant(
    applicant,
    `${applicant.name ?? "応募者"}さん、応募を受け付けました。\n面接・見学の公開枠がある場合は、こちらから希望日時を予約できます。\n${scheduleUrl}`,
    "auto",
    { templateId: "apply-thanks", stage: "応募" }
  );

  const schedules = await scheduleRuleMessagesForApplicant(getBaseUrl(request), applicant, "応募");

  return NextResponse.json({ ok: true, applicant, messageResult, schedules, scheduleUrl, baseUrl: getBaseUrl(request) });
}
