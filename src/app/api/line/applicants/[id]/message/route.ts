import { NextRequest, NextResponse } from "next/server";
import { listLineApplicants } from "@/lib/line-applicant-store";
import { sendLineMessageForApplicant, sendTemplateToApplicant } from "@/lib/line-workflow";
import { getRoleFromRequest, roleHasPermission } from "@/lib/rbac";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionEmail = request.cookies.get("recruit-ai-session-email")?.value?.trim();
  if (!sessionEmail) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const role = getRoleFromRequest(request);
  if (!roleHasPermission(role, "message:send:1to1")) {
    return NextResponse.json({ ok: false, error: "forbidden", role: role.id }, { status: 403 });
  }

  const { id } = await params;
  const input = (await request.json()) as { text?: string; templateId?: string };
  const applicant = (await listLineApplicants()).find((item) => item.id === id);

  if (!applicant) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  if (!input.text?.trim() && !input.templateId) {
    return NextResponse.json({ ok: false, error: "text or templateId is required" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  const result = input.templateId
    ? await sendTemplateToApplicant(baseUrl, applicant, input.templateId, "manual")
    : await sendLineMessageForApplicant(applicant, input.text?.trim() ?? "", "manual");

  return NextResponse.json({ ok: true, result });
}
