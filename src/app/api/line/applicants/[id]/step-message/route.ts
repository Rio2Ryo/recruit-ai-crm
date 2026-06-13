import { NextRequest, NextResponse } from "next/server";
import { listLineApplicants } from "@/lib/line-applicant-store";
import { sendStepMessages } from "@/lib/line-workflow";

function isAuthorized(request: NextRequest) {
  const adminKey = process.env.LINE_CLI_ADMIN_KEY ?? process.env.LINE_SETTINGS_ADMIN_KEY;
  if (!adminKey) return false;
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
  const input = (await request.json().catch(() => ({}))) as { templateIds?: string[] };
  const applicant = (await listLineApplicants()).find((item) => item.id === id);

  if (!applicant) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  const run = await sendStepMessages(baseUrl, applicant, input.templateIds);
  return NextResponse.json({ ok: true, run });
}
