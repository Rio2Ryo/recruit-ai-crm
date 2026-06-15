import { NextRequest, NextResponse } from "next/server";
import { getLineAnalyticsSummary } from "@/lib/line-applicant-store";

export async function GET(request: NextRequest) {
  const sessionEmail = request.cookies.get("recruit-ai-session-email")?.value?.trim();
  if (!sessionEmail) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true, analytics: await getLineAnalyticsSummary() });
}
