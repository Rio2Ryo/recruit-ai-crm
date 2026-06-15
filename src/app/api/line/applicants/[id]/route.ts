import { NextRequest, NextResponse } from "next/server";
import { funnelStages, type FunnelStage } from "@/lib/recruiting-stages";
import { getLineApplicant, updateLineApplicant } from "@/lib/line-applicant-store";
import { scheduleRuleMessagesForApplicant } from "@/lib/line-scheduler";
import { runStageAutomation } from "@/lib/line-workflow";
import { getRoleFromRequest, roleHasPermission } from "@/lib/rbac";

function isFunnelStage(value: unknown): value is FunnelStage {
  return typeof value === "string" && funnelStages.includes(value as FunnelStage);
}

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL ?? `${request.nextUrl.protocol}//${request.nextUrl.host}`;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionEmail = request.cookies.get("recruit-ai-session-email")?.value?.trim();
  if (!sessionEmail) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const role = getRoleFromRequest(request);
  if (!roleHasPermission(role, "status:update")) {
    return NextResponse.json({ ok: false, error: "forbidden", role: role.id }, { status: 403 });
  }

  const { id } = await params;
  const before = await getLineApplicant(id);
  const input = (await request.json()) as {
    currentStage?: unknown;
    interviewAt?: string;
    feedback?: string;
  };

  const applicant = await updateLineApplicant(id, {
    ...(isFunnelStage(input.currentStage) ? { currentStage: input.currentStage } : {}),
    ...(typeof input.interviewAt === "string" ? { interviewAt: input.interviewAt } : {}),
    ...(typeof input.feedback === "string" ? { feedback: input.feedback } : {}),
  });

  if (!applicant) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  const stageChanged = Boolean(before && isFunnelStage(input.currentStage) && before.currentStage !== input.currentStage);

  const automationResult = stageChanged && isFunnelStage(input.currentStage)
    ? await runStageAutomation(getBaseUrl(request), applicant, input.currentStage)
    : null;

  const schedules = stageChanged && isFunnelStage(input.currentStage)
    ? await scheduleRuleMessagesForApplicant(getBaseUrl(request), applicant, input.currentStage)
    : [];

  return NextResponse.json({ ok: true, applicant, automationResult, schedules });
}
