import { NextRequest, NextResponse } from "next/server";
import { processDueScheduledMessages } from "@/lib/line-scheduler";

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL ?? `${request.nextUrl.protocol}//${request.nextUrl.host}`;
}

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const result = await processDueScheduledMessages(getBaseUrl(request));
  return NextResponse.json({ ok: true, ...result });
}
