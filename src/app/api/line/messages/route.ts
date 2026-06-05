import { NextRequest, NextResponse } from "next/server";
import { listLineApplicants } from "@/lib/line-applicant-store";
import { sendLineMessageForApplicant } from "@/lib/line-workflow";
import { getRoleFromRequest, roleHasPermission } from "@/lib/rbac";

export async function POST(request: NextRequest) {
  const role = getRoleFromRequest(request);
  if (!roleHasPermission(role, "message:send:1to1")) {
    return NextResponse.json({ ok: false, error: "forbidden", role: role.id }, { status: 403 });
  }

  const input = (await request.json().catch(() => ({}))) as {
    applicantId?: string;
    targetMode?: "individual" | "job" | "all";
    jobTitle?: string;
    text?: string;
  };

  if (!input.text?.trim()) {
    return NextResponse.json({ ok: false, error: "text is required" }, { status: 400 });
  }

  const applicants = await listLineApplicants();
  const targetMode = input.targetMode ?? "individual";
  if ((targetMode === "all" || targetMode === "job") && !roleHasPermission(role, "message:send:broadcast")) {
    return NextResponse.json({ ok: false, error: "forbidden", role: role.id }, { status: 403 });
  }
  const targets = targetMode === "all"
    ? applicants
    : targetMode === "job"
      ? applicants.filter((item) => (item.jobTitle ?? "希望職種未定") === input.jobTitle)
      : applicants.filter((item) => item.id === input.applicantId);

  if (targets.length === 0) {
    return NextResponse.json({ ok: false, error: targetMode === "job" ? "job targets are required" : "applicant is required" }, { status: 400 });
  }

  const results = await Promise.all(targets.map((applicant) => sendLineMessageForApplicant(applicant, input.text!.trim(), "manual")));

  return NextResponse.json({
    ok: true,
    count: results.length,
    sent: results.filter((result) => result.status === "sent" || result.status === "skipped").length,
    failed: results.filter((result) => result.status === "failed").length,
    results,
  });
}
