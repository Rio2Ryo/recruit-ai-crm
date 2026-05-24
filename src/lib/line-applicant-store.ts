import "server-only";
import { createLineApplicant, type LineApplicant } from "@/lib/line-recruiting";

const globalForLineApplicants = globalThis as unknown as {
  lineApplicants?: LineApplicant[];
};

function getStore() {
  if (!globalForLineApplicants.lineApplicants) {
    globalForLineApplicants.lineApplicants = [];
  }
  return globalForLineApplicants.lineApplicants;
}

export function saveLineApplicant(input: Partial<LineApplicant> & { lineUserId: string }) {
  const store = getStore();
  const applicant = createLineApplicant(input);
  const existingIndex = store.findIndex(
    (item) =>
      item.lineUserId === applicant.lineUserId &&
      (applicant.name ? item.name === applicant.name : item.step !== "submitted")
  );

  if (existingIndex >= 0) {
    store[existingIndex] = { ...store[existingIndex], ...applicant, id: store[existingIndex].id };
    return store[existingIndex];
  }

  store.unshift(applicant);
  return applicant;
}

export function listLineApplicants() {
  return getStore().slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function toStudentRow(applicant: LineApplicant) {
  return {
    id: applicant.id,
    name: applicant.name ?? applicant.displayName ?? "LINE応募者",
    school: applicant.school ?? "未入力",
    department: applicant.department ?? "未入力",
    status: applicant.currentStage,
    score: 75,
    source: applicant.source,
    phone: applicant.phone,
    email: applicant.email,
    updatedAt: applicant.updatedAt,
  };
}

export function toFunnelCandidate(applicant: LineApplicant) {
  const date = applicant.updatedAt.slice(0, 10);
  return {
    id: applicant.id,
    name: applicant.name ?? applicant.displayName ?? "LINE応募者",
    source: "LINE" as const,
    currentStage: applicant.currentStage,
    appliedAt: applicant.createdAt.slice(0, 10),
    lastUpdated: date,
    position: applicant.jobTitle ?? "未定",
    note: applicant.lastMessage ?? applicant.selfPr,
  };
}
