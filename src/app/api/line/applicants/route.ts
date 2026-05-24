import { NextResponse } from "next/server";
import { listLineApplicants, toFunnelCandidate, toStudentRow } from "@/lib/line-applicant-store";

export async function GET() {
  const applicants = listLineApplicants();

  return NextResponse.json({
    ok: true,
    applicants,
    students: applicants.map(toStudentRow),
    funnelCandidates: applicants.map(toFunnelCandidate),
  });
}
