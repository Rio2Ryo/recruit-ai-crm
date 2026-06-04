import { NextResponse } from "next/server";
import { getLineAnalyticsSummary } from "@/lib/line-applicant-store";

export async function GET() {
  return NextResponse.json({ ok: true, analytics: await getLineAnalyticsSummary() });
}
