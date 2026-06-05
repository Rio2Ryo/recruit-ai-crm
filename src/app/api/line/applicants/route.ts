import { NextRequest, NextResponse } from "next/server";
import {
  listLineApplicants,
  listLineNotifications,
  toFunnelCandidate,
  toResumeRows,
  toStudentRow,
} from "@/lib/line-applicant-store";
import { getRoleFromRequest, maskLineApplicant, roleHasPermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  const role = getRoleFromRequest(request);
  if (!roleHasPermission(role, "status:view")) {
    return NextResponse.json({ ok: false, error: "forbidden", role: role.id }, { status: 403 });
  }

  const applicants = (await listLineApplicants()).map((applicant) =>
    maskLineApplicant(applicant, role.id)
  );

  return NextResponse.json({
    ok: true,
    role: role.id,
    applicants,
    notifications: await listLineNotifications(),
    students: applicants.map(toStudentRow),
    funnelCandidates: applicants.map(toFunnelCandidate),
    resumes: toResumeRows(applicants),
  });
}
