import "server-only";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { createLineApplicant, type LineActionEvent, type LineApplicant, type LineAttachment, type LineMessageLog, type LineStepRun } from "@/lib/line-recruiting";
import type { FunnelStage } from "@/lib/demo-data";

export type LineNotification = {
  id: string;
  applicantId: string;
  lineUserId: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
};

const globalForLineApplicants = globalThis as unknown as {
  lineApplicants?: LineApplicant[];
  lineNotifications?: LineNotification[];
  lineActionEvents?: LineActionEvent[];
  lineMessageLogs?: LineMessageLog[];
  lineStepRuns?: LineStepRun[];
};

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function uuid() { return randomUUID(); }
function nowDate() { return new Date(); }
function iso(value: Date | string | null | undefined) { return value ? new Date(value).toISOString() : new Date().toISOString(); }
function safeJson(value: unknown) { return value === undefined ? undefined : JSON.stringify(value); }
function parseJson<T>(value: string | null | undefined, fallback: T): T { try { return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } }
function isUuid(value: string | undefined) { return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)); }
function optionalDate(value: string | undefined) { return value && !Number.isNaN(Date.parse(value)) ? new Date(value) : undefined; }

function memoryStore() { if (!globalForLineApplicants.lineApplicants) globalForLineApplicants.lineApplicants = []; return globalForLineApplicants.lineApplicants; }
function memoryNotifications() { if (!globalForLineApplicants.lineNotifications) globalForLineApplicants.lineNotifications = []; return globalForLineApplicants.lineNotifications; }
function memoryEvents() { if (!globalForLineApplicants.lineActionEvents) globalForLineApplicants.lineActionEvents = []; return globalForLineApplicants.lineActionEvents; }
function memoryMessages() { if (!globalForLineApplicants.lineMessageLogs) globalForLineApplicants.lineMessageLogs = []; return globalForLineApplicants.lineMessageLogs; }
function memorySteps() { if (!globalForLineApplicants.lineStepRuns) globalForLineApplicants.lineStepRuns = []; return globalForLineApplicants.lineStepRuns; }

type LineApplicantRecordLike = {
  id: string;
  lineUserId: string;
  friendId?: string | null;
  name?: string | null;
  school?: string | null;
  department?: string | null;
  phone?: string | null;
  email?: string | null;
  jobId?: string | null;
  jobTitle?: string | null;
  selfPr?: string | null;
  currentStage: string;
  interviewAt?: Date | string | null;
  feedback?: string | null;
  lastMessage?: string | null;
  payloadJson?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type LineDocumentRecordLike = {
  id: string;
  applicantId?: string | null;
  lineUserId: string;
  messageId: string;
  fileName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  storageKey?: string | null;
  storageUrl?: string | null;
  createdAt: Date | string;
};

type LineMessageLogRecordLike = {
  id: string;
  applicantId?: string | null;
  lineUserId: string;
  friendId?: string | null;
  kind: string;
  templateId?: string | null;
  stage?: string | null;
  text: string;
  status: string;
  resultJson?: string | null;
  error?: string | null;
  createdAt: Date | string;
};

type LineActionEventRecordLike = {
  id: string;
  applicantId?: string | null;
  lineUserId: string;
  friendId?: string | null;
  type: string;
  label: string;
  detailJson?: string | null;
  createdAt: Date | string;
};

function toApplicant(record: LineApplicantRecordLike, extras: { docs?: LineDocumentRecordLike[]; logs?: LineMessageLogRecordLike[]; events?: LineActionEventRecordLike[] } = {}): LineApplicant {
  const payload = parseJson<Record<string, unknown>>(record.payloadJson, {});
  return {
    id: record.id,
    lineUserId: record.lineUserId,
    friendId: record.friendId ?? undefined,
    name: record.name ?? undefined,
    school: record.school ?? undefined,
    department: record.department ?? undefined,
    phone: record.phone ?? undefined,
    email: record.email ?? undefined,
    jobId: record.jobId ?? undefined,
    jobTitle: record.jobTitle ?? undefined,
    selfPr: record.selfPr ?? undefined,
    currentStage: record.currentStage as FunnelStage,
    source: "LINE",
    step: (payload.step as LineApplicant["step"]) ?? "submitted",
    createdAt: iso(record.createdAt),
    updatedAt: iso(record.updatedAt),
    interviewAt: record.interviewAt ? iso(record.interviewAt) : payload.interviewAt as string | undefined,
    feedback: record.feedback ?? payload.feedback as string | undefined,
    displayName: payload.displayName as string | undefined,
    lastMessage: record.lastMessage ?? undefined,
    attachments: (extras.docs ?? []).map(toAttachment),
    messageLogs: (extras.logs ?? []).map(toMessageLog),
    actionEvents: (extras.events ?? []).map(toActionEvent),
    stepRuns: [],
  };
}
function toAttachment(record: LineDocumentRecordLike): LineAttachment {
  const detail = parseJson<Record<string, unknown>>(record.storageKey, {});
  return { id: record.id, lineUserId: record.lineUserId, messageId: record.messageId, type: (detail.type as LineAttachment["type"]) ?? "file", fileName: record.fileName ?? undefined, storageKey: detail.storagePath as string | undefined, storageUrl: record.storageUrl ?? undefined, contentUrl: detail.contentUrl as string | undefined, mimeType: record.mimeType ?? undefined, size: record.size ?? undefined, savedAt: iso(record.createdAt) };
}
function toMessageLog(record: LineMessageLogRecordLike): LineMessageLog {
  return { id: record.id, applicantId: record.applicantId ?? "", lineUserId: record.lineUserId, friendId: record.friendId ?? undefined, kind: record.kind as LineMessageLog["kind"], templateId: record.templateId ?? undefined, stage: record.stage as FunnelStage | undefined, text: record.text, status: record.status as LineMessageLog["status"], result: parseJson(record.resultJson, undefined), error: record.error ?? undefined, createdAt: iso(record.createdAt) };
}
function toActionEvent(record: LineActionEventRecordLike): LineActionEvent {
  return { id: record.id, applicantId: record.applicantId ?? undefined, lineUserId: record.lineUserId, friendId: record.friendId ?? undefined, type: record.type as LineActionEvent["type"], label: record.label, detail: parseJson(record.detailJson, undefined), createdAt: iso(record.createdAt) };
}

const lineApplicantCompatSelect = {
  id: true,
  lineUserId: true,
  friendId: true,
  name: true,
  school: true,
  department: true,
  phone: true,
  email: true,
  jobId: true,
  jobTitle: true,
  selfPr: true,
  currentStage: true,
  interviewAt: true,
  feedback: true,
  lastMessage: true,
  payloadJson: true,
  createdAt: true,
  updatedAt: true,
} as const;

async function dbAvailable() { return Boolean(process.env.DATABASE_URL); }

export async function recordLineAction(input: Omit<LineActionEvent, "id" | "createdAt">) {
  const event: LineActionEvent = { ...input, id: isUuid(input.applicantId) ? uuid() : id("line-action"), createdAt: new Date().toISOString() };
  if (await dbAvailable()) {
    try {
      const row = await prisma.lineActionEventRecord.create({ data: { id: uuid(), applicantId: input.applicantId, lineUserId: input.lineUserId, friendId: input.friendId, type: input.type, label: input.label, detailJson: safeJson(input.detail) } });
      return toActionEvent(row);
    } catch (error) { console.warn("recordLineAction db fallback", error); }
  }
  memoryEvents().unshift(event);
  const store = memoryStore();
  const index = store.findIndex((item) => item.id === input.applicantId || item.lineUserId === input.lineUserId);
  if (index >= 0) store[index] = { ...store[index], actionEvents: [event, ...(store[index].actionEvents ?? [])], updatedAt: event.createdAt };
  return event;
}

export async function saveLineApplicant(input: Partial<LineApplicant> & { lineUserId: string }): Promise<LineApplicant> {
  const applicant = createLineApplicant(input);
  if (await dbAvailable()) {
    try {
      const existing = await prisma.lineApplicantRecord.findFirst({ where: { lineUserId: applicant.lineUserId }, orderBy: { updatedAt: "desc" }, select: lineApplicantCompatSelect });
      const payload = { step: input.step ?? applicant.step, interviewAt: input.interviewAt, feedback: input.feedback, displayName: input.displayName };
      const data = { lineUserId: applicant.lineUserId, friendId: applicant.friendId, name: applicant.name, school: applicant.school, department: applicant.department, phone: applicant.phone, email: applicant.email, jobId: applicant.jobId, jobTitle: applicant.jobTitle, selfPr: applicant.selfPr, currentStage: applicant.currentStage, interviewAt: optionalDate(input.interviewAt), feedback: input.feedback, lastMessage: applicant.lastMessage, payloadJson: safeJson(payload), updatedAt: nowDate() };
      const row = existing
        ? await prisma.lineApplicantRecord.update({ where: { id: existing.id }, data, select: lineApplicantCompatSelect })
        : await prisma.lineApplicantRecord.create({ data: { ...data, id: uuid(), createdAt: nowDate() }, select: lineApplicantCompatSelect });
      if (!existing && applicant.currentStage === "応募") memoryNotifications().unshift({ id: id("line-notification"), applicantId: row.id, lineUserId: row.lineUserId, title: "LINEから応募がありました", description: `${row.name ?? "LINE応募者"} / ${row.jobTitle ?? "希望職種未定"}`, createdAt: new Date().toISOString(), read: false });
      return toApplicant(row);
    } catch (error) { console.warn("saveLineApplicant db fallback", error); }
  }
  const store = memoryStore();
  const existingIndex = store.findIndex((item) => item.lineUserId === applicant.lineUserId && (applicant.name ? item.name === applicant.name : item.step !== "submitted"));
  if (existingIndex >= 0) { store[existingIndex] = { ...store[existingIndex], ...applicant, id: store[existingIndex].id, createdAt: store[existingIndex].createdAt, attachments: [...(store[existingIndex].attachments ?? []), ...(applicant.attachments ?? [])] }; return store[existingIndex]; }
  store.unshift(applicant); return applicant;
}

export async function listLineApplicants(): Promise<LineApplicant[]> {
  if (await dbAvailable()) {
    try {
      const [rows, docs, logs, events] = await Promise.all([
        prisma.lineApplicantRecord.findMany({ orderBy: { updatedAt: "desc" }, select: lineApplicantCompatSelect }),
        prisma.lineDocumentRecord.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.lineMessageLogRecord.findMany({ orderBy: { createdAt: "desc" } }),
        prisma.lineActionEventRecord.findMany({ orderBy: { createdAt: "desc" } }),
      ]);
      const applicantRows = rows as LineApplicantRecordLike[];
      const documentRows = docs as LineDocumentRecordLike[];
      const logRows = logs as LineMessageLogRecordLike[];
      const eventRows = events as LineActionEventRecordLike[];
      return applicantRows.map((row) => toApplicant(row, { docs: documentRows.filter((d) => d.lineUserId === row.lineUserId), logs: logRows.filter((l) => l.lineUserId === row.lineUserId), events: eventRows.filter((e) => e.lineUserId === row.lineUserId) }));
    } catch (error) { console.warn("listLineApplicants db fallback", error); }
  }
  return memoryStore().slice().sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
}
export async function getLineApplicant(idOrLineUserId: string): Promise<LineApplicant | null> { return (await listLineApplicants()).find((item) => item.id === idOrLineUserId || item.lineUserId === idOrLineUserId) ?? null; }
export async function listLineNotifications(): Promise<LineNotification[]> { return memoryNotifications().slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt)); }
export async function listLineActionEvents(): Promise<LineActionEvent[]> { if (await dbAvailable()) { try { return ((await prisma.lineActionEventRecord.findMany({ orderBy: { createdAt: "desc" } })) as LineActionEventRecordLike[]).map((row) => toActionEvent(row)); } catch {} } return memoryEvents().slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt)); }
export async function listLineMessageLogs(): Promise<LineMessageLog[]> { if (await dbAvailable()) { try { return ((await prisma.lineMessageLogRecord.findMany({ orderBy: { createdAt: "desc" } })) as LineMessageLogRecordLike[]).map((row) => toMessageLog(row)); } catch {} } return memoryMessages().slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt)); }
export async function listLineStepRuns(): Promise<LineStepRun[]> { return memorySteps().slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt)); }

export async function updateLineApplicant(applicantId: string, updates: Partial<Pick<LineApplicant, "currentStage" | "interviewAt" | "feedback" | "lastMessage">>): Promise<LineApplicant | null> {
  const before = await getLineApplicant(applicantId);
  if (!before) return null;
  if (await dbAvailable()) {
    try {
      const interviewAt = updates.interviewAt ?? before.interviewAt;
      const feedback = updates.feedback ?? before.feedback;
      const payload = { step: before.step, interviewAt, feedback, displayName: before.displayName };
      const row = await prisma.lineApplicantRecord.update({ where: { id: before.id }, data: { currentStage: updates.currentStage ?? before.currentStage, interviewAt: optionalDate(interviewAt), feedback, lastMessage: updates.lastMessage ?? before.lastMessage, payloadJson: safeJson(payload), updatedAt: nowDate() }, select: lineApplicantCompatSelect });
      if (updates.currentStage && updates.currentStage !== before.currentStage) await recordLineAction({ applicantId: before.id, lineUserId: before.lineUserId, friendId: before.friendId, type: "status_change", label: `${before.currentStage} → ${updates.currentStage}`, detail: { before: before.currentStage, after: updates.currentStage } });
      return toApplicant(row);
    } catch (error) { console.warn("updateLineApplicant db fallback", error); }
  }
  const store = memoryStore(); const index = store.findIndex((item)=>item.id===applicantId); if(index<0) return null; store[index]={...store[index],...updates,updatedAt:new Date().toISOString()}; return store[index];
}

export async function addLineMessageLog(input: Omit<LineMessageLog, "id" | "createdAt">) {
  if (await dbAvailable()) {
    try {
      const row = await prisma.lineMessageLogRecord.create({ data: { id: uuid(), applicantId: input.applicantId, lineUserId: input.lineUserId, friendId: input.friendId, kind: input.kind, templateId: input.templateId, stage: input.stage, text: input.text, status: input.status, resultJson: safeJson(input.result), error: input.error } });
      await prisma.lineApplicantRecord.updateMany({ where: { OR: [{ id: input.applicantId }, { lineUserId: input.lineUserId }] }, data: { lastMessage: `${input.kind}: ${input.text}`, updatedAt: nowDate() } });
      await recordLineAction({ applicantId: input.applicantId, lineUserId: input.lineUserId, friendId: input.friendId, type: input.kind === "step" ? "step_send" : "message_send", label: input.status === "sent" ? "LINE message sent" : `LINE message ${input.status}`, detail: { kind: input.kind, templateId: input.templateId, status: input.status, error: input.error } });
      return toMessageLog(row);
    } catch (error) { console.warn("addLineMessageLog db fallback", error); }
  }
  const log: LineMessageLog = { ...input, id: id("line-message"), createdAt: new Date().toISOString() }; memoryMessages().unshift(log); return log;
}
export async function addLineStepRun(input: Omit<LineStepRun, "id" | "createdAt">) { const run: LineStepRun = { ...input, id: id("line-step-run"), createdAt: new Date().toISOString() }; memorySteps().unshift(run); return run; }

export async function addLineAttachment(lineUserId: string, attachment: Omit<LineAttachment, "id" | "lineUserId" | "savedAt">) {
  let applicant = await getLineApplicant(lineUserId);
  if (!applicant) applicant = await saveLineApplicant({ lineUserId, currentStage: "LINE流入", step: "profile", lastMessage: `${attachment.type} attachment received` });
  if (await dbAvailable()) {
    try {
      const row = await prisma.lineDocumentRecord.create({ data: { id: uuid(), applicantId: applicant.id, lineUserId, messageId: attachment.messageId, fileName: attachment.fileName, mimeType: attachment.mimeType, size: attachment.size, storageKey: safeJson({ storagePath: attachment.storageKey, contentUrl: attachment.contentUrl, type: attachment.type }), storageUrl: attachment.storageUrl } });
      await prisma.lineApplicantRecord.update({ where: { id: applicant.id }, data: { lastMessage: `${attachment.type} attachment received`, updatedAt: nowDate() } });
      const saved = toAttachment(row);
      await recordLineAction({ applicantId: applicant.id, lineUserId, friendId: applicant.friendId, type: "document_upload", label: saved.fileName ?? `LINE ${saved.type}`, detail: { messageId: saved.messageId, type: saved.type, storageKey: saved.storageKey, storageUrl: saved.storageUrl, size: saved.size, mimeType: saved.mimeType } });
      return { applicant: { ...applicant, attachments: [saved, ...(applicant.attachments ?? [])] }, attachment: saved };
    } catch (error) { console.warn("addLineAttachment db fallback", error); }
  }
  const savedAttachment: LineAttachment = { ...attachment, id: id("line-attachment"), lineUserId, savedAt: new Date().toISOString() }; return { applicant, attachment: savedAttachment };
}

export async function getLineAnalyticsSummary() {
  const applicants = await listLineApplicants(); const events = await listLineActionEvents(); const messages = await listLineMessageLogs(); const documents = applicants.flatMap((a)=>a.attachments ?? []);
  const byType = events.reduce<Record<string, number>>((acc,e)=>{acc[e.type]=(acc[e.type]??0)+1; return acc;},{});
  const byStage = applicants.reduce<Record<string, number>>((acc,a)=>{acc[a.currentStage]=(acc[a.currentStage]??0)+1; return acc;},{});
  return { totals: { applicants: applicants.length, events: events.length, messages: messages.length, documents: documents.length }, byType, byStage, recentEvents: events.slice(0,20), recentMessages: messages.slice(0,20), documents: documents.slice(0,20) };
}

export function toStudentRow(applicant: LineApplicant) { return { id: applicant.id, name: applicant.name ?? applicant.displayName ?? "LINE応募者", school: applicant.school ?? "未入力", department: applicant.department ?? "未入力", status: applicant.currentStage, score: 75, source: applicant.source, phone: applicant.phone, email: applicant.email, jobTitle: applicant.jobTitle, lineUserId: applicant.lineUserId, friendId: applicant.friendId, interviewAt: applicant.interviewAt, feedback: applicant.feedback, attachments: applicant.attachments ?? [], attachmentsCount: applicant.attachments?.length ?? 0, messageLogs: applicant.messageLogs ?? [], messageCount: applicant.messageLogs?.length ?? 0, actionEvents: applicant.actionEvents ?? [], actionCount: applicant.actionEvents?.length ?? 0, scheduledCount: applicant.actionEvents?.filter((event) => event.type === "scheduled_message").length ?? 0, lastMessage: applicant.lastMessage, updatedAt: applicant.updatedAt }; }
export function toFunnelCandidate(applicant: LineApplicant) { const date = applicant.updatedAt.slice(0, 10); return { id: applicant.id, name: applicant.name ?? applicant.displayName ?? "LINE応募者", source: "LINE" as const, currentStage: applicant.currentStage, appliedAt: date, lastUpdated: date, position: applicant.jobTitle ?? "未定", note: applicant.feedback ?? applicant.lastMessage ?? applicant.selfPr }; }
export function toResumeRows(applicants: LineApplicant[]) { return applicants.flatMap((applicant) => (applicant.attachments ?? []).map((attachment) => ({ id: attachment.id, student: applicant.name ?? applicant.displayName ?? "LINE応募者", school: applicant.school ?? "未入力", department: applicant.department ?? "未入力", title: attachment.fileName ?? `LINE ${attachment.type}`, status: "確認待ち", access: "採用担当以上", updatedAt: attachment.savedAt.slice(0, 10), summary: `LINE ID ${applicant.lineUserId} から受信した添付ファイルです。`, highlights: ["LINE添付", attachment.type, applicant.currentStage], lineUserId: applicant.lineUserId, messageId: attachment.messageId, contentUrl: attachment.storageUrl ?? attachment.contentUrl, storageKey: attachment.storageKey, mimeType: attachment.mimeType, size: attachment.size })) ); }
