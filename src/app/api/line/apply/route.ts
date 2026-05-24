import { NextRequest, NextResponse } from "next/server";
import { saveLineApplicant } from "@/lib/line-applicant-store";

async function pushText(userId: string, text: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return { skipped: true, reason: "LINE_CHANNEL_ACCESS_TOKEN is not set" };

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text }],
    }),
  });

  if (!response.ok) {
    return { skipped: false, ok: false, status: response.status, detail: await response.text() };
  }

  return { skipped: false, ok: true };
}

export async function POST(request: NextRequest) {
  const input = await request.json();
  const applicant = saveLineApplicant({
    lineUserId: input.lineUserId || "demo-line-user",
    name: input.name,
    school: input.school,
    department: input.department,
    phone: input.phone,
    email: input.email,
    jobId: input.jobId,
    selfPr: input.selfPr,
    currentStage: "応募",
  });

  const messageResult = input.lineUserId
    ? await pushText(
        input.lineUserId,
        `${applicant.name ?? "応募者"}さん、応募を受け付けました。\n担当者が確認後、面接・見学の日程をこのLINEでご連絡します。`
      )
    : { skipped: true, reason: "lineUserId is empty; demo applicant accepted only" };

  return NextResponse.json({ ok: true, applicant, messageResult });
}
