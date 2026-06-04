import { NextRequest, NextResponse } from "next/server";
import { saveLineApplicant } from "@/lib/line-applicant-store";
import { getLineHarnessClient, getStringField, type LineHarnessFormSubmission } from "@/lib/line-harness";
import { scheduleRuleMessagesForApplicant } from "@/lib/line-scheduler";

function isAuthorized(request: NextRequest) {
  const secret = process.env.LINE_HARNESS_WEBHOOK_SECRET;
  if (!secret) return true;

  return request.headers.get("x-line-harness-secret") === secret;
}

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL ?? `${request.nextUrl.protocol}//${request.nextUrl.host}`;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    name: "Recruit AI CRM LINE Harness submission webhook",
    requiredEnv: ["LINE_HARNESS_API_URL", "LINE_HARNESS_API_KEY"],
    optionalEnv: ["LINE_HARNESS_WEBHOOK_SECRET", "LINE_HARNESS_APPLIED_TAG_ID"],
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as LineHarnessFormSubmission | { submission?: LineHarnessFormSubmission };
  const submission: LineHarnessFormSubmission =
    "submission" in payload && payload.submission ? payload.submission : (payload as LineHarnessFormSubmission);
  const data = submission.data ?? {};

  const applicant = await saveLineApplicant({
    lineUserId: submission.lineUserId ?? submission.friendId ?? "line-harness-friend",
    friendId: submission.friendId,
    name: getStringField(data, ["name", "氏名", "fullName", "お名前"]),
    school: getStringField(data, ["school", "学校名", "schoolName"]),
    department: getStringField(data, ["department", "学科", "学部・学科"]),
    phone: getStringField(data, ["phone", "電話番号", "tel"]),
    email: getStringField(data, ["email", "メールアドレス"]),
    jobId: getStringField(data, ["jobId", "希望職種ID"]),
    jobTitle: getStringField(data, ["jobTitle", "希望職種", "職種"]),
    selfPr: getStringField(data, ["selfPr", "自己PR・質問", "自己PR", "質問"]),
    currentStage: "応募",
    lastMessage: `LINE Harness form submitted${submission.formId ? `: ${submission.formId}` : ""}`,
  });

  const client = getLineHarnessClient();
  const appliedTagId = process.env.LINE_HARNESS_APPLIED_TAG_ID;
  const harnessUpdates: string[] = [];

  if (client && submission.friendId) {
    await client.setMetadata(submission.friendId, {
      recruitCandidateId: applicant.id,
      recruitStage: applicant.currentStage,
      recruitSource: "LINE Harness",
      applicantName: applicant.name,
      applicantSchool: applicant.school,
      applicantJobTitle: applicant.jobTitle,
      submittedAt: submission.submittedAt ?? applicant.createdAt,
    });
    harnessUpdates.push("metadata");

    if (appliedTagId) {
      await client.addTag(submission.friendId, appliedTagId);
      harnessUpdates.push("applied-tag");
    }
  }

  const schedules = await scheduleRuleMessagesForApplicant(getBaseUrl(request), applicant, "応募");

  return NextResponse.json({ ok: true, applicant, harnessUpdates, schedules });
}
