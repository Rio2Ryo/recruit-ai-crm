import "server-only";

import { randomUUID } from "node:crypto";
import type { FunnelStage } from "@/lib/recruiting-stages";
import { getLineApplicant, recordLineAction } from "@/lib/line-applicant-store";
import { getLineOperationalSettingsAsync } from "@/lib/line-settings-store";
import type { LineApplicant } from "@/lib/line-recruiting";
import { sendLineMessageForApplicant, sendTemplateToApplicant } from "@/lib/line-workflow";
import { prisma } from "@/lib/prisma";

export type ScheduledMessageRule = {
  id: string;
  title: string;
  enabled?: boolean;
  trigger: "stage_entered";
  stage: FunnelStage;
  templateId?: string;
  delayAmount: number;
  delayUnit: "minutes" | "hours" | "days";
};

export type ScheduledLineMessage = {
  id: string;
  applicantId: string;
  lineUserId: string;
  friendId?: string;
  title: string;
  ruleId?: string;
  stage?: FunnelStage;
  templateId?: string;
  text?: string;
  scheduledFor: string;
  status: "pending" | "sent" | "failed" | "cancelled";
  createdAt: string;
  sentAt?: string;
  error?: string;
};

const globalForLineScheduler = globalThis as unknown as { scheduledLineMessages?: ScheduledLineMessage[] };
function id(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function getStore() { if (!globalForLineScheduler.scheduledLineMessages) globalForLineScheduler.scheduledLineMessages = []; return globalForLineScheduler.scheduledLineMessages; }
function dbAvailable() { return Boolean(process.env.DATABASE_URL); }
function iso(value: Date | string | null | undefined) { return value ? new Date(value).toISOString() : new Date().toISOString(); }
type ScheduledLineMessageRecordLike = {
  id: string;
  applicantId?: string | null;
  lineUserId: string;
  friendId?: string | null;
  title: string;
  ruleId?: string | null;
  stage?: string | null;
  templateId?: string | null;
  text?: string | null;
  scheduledFor: Date | string;
  status: string;
  createdAt: Date | string;
  sentAt?: Date | string | null;
  error?: string | null;
};
function toSchedule(row: ScheduledLineMessageRecordLike): ScheduledLineMessage { return { id: row.id, applicantId: row.applicantId ?? "", lineUserId: row.lineUserId, friendId: row.friendId ?? undefined, title: row.title, ruleId: row.ruleId ?? undefined, stage: row.stage as FunnelStage | undefined, templateId: row.templateId ?? undefined, text: row.text ?? undefined, scheduledFor: iso(row.scheduledFor), status: row.status as ScheduledLineMessage["status"], createdAt: iso(row.createdAt), sentAt: row.sentAt ? iso(row.sentAt) : undefined, error: row.error ?? undefined }; }

function parseArray<T>(value: string | undefined): T[] { if (!value) return []; try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed as T[] : []; } catch { return []; } }
function addDelay(base: Date, amount: number, unit: ScheduledMessageRule["delayUnit"]) { const minutes = unit === "minutes" ? amount : unit === "hours" ? amount * 60 : amount * 60 * 24; return new Date(base.getTime() + minutes * 60_000); }
function interpolate(text: string, applicant: LineApplicant) { return text.replaceAll("{{name}}", applicant.name ?? applicant.displayName ?? "応募者").replaceAll("{{school}}", applicant.school ?? "学校名未入力").replaceAll("{{jobTitle}}", applicant.jobTitle ?? "希望職種未定").replaceAll("{{stage}}", applicant.currentStage).replaceAll("{{url}}", ""); }

export async function getScheduledMessageRules(baseUrl: string) { const settings = await getLineOperationalSettingsAsync(baseUrl); return parseArray<ScheduledMessageRule>(settings.scheduledMessageRulesJson); }

async function cancelExistingRuleSchedules(applicantId: string, ruleId: string) {
  if (dbAvailable()) {
    try { await prisma.scheduledLineMessageRecord.updateMany({ where: { applicantId, ruleId, status: "pending" }, data: { status: "cancelled" } }); return; } catch (error) { console.warn("cancel schedule db fallback", error); }
  }
  for (const item of getStore()) if (item.applicantId === applicantId && item.ruleId === ruleId && item.status === "pending") item.status = "cancelled";
}

export async function listScheduledLineMessages(): Promise<ScheduledLineMessage[]> {
  if (dbAvailable()) {
    try { return ((await prisma.scheduledLineMessageRecord.findMany({ orderBy: { scheduledFor: "asc" } })) as ScheduledLineMessageRecordLike[]).map((row) => toSchedule(row)); } catch (error) { console.warn("list schedules db fallback", error); }
  }
  return getStore().slice().sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
}

export async function scheduleLineMessage(input: Omit<ScheduledLineMessage, "id" | "createdAt" | "status">) {
  let scheduled: ScheduledLineMessage;
  if (dbAvailable()) {
    try {
      const row = await prisma.scheduledLineMessageRecord.create({ data: { id: randomUUID(), applicantId: input.applicantId, lineUserId: input.lineUserId, friendId: input.friendId, title: input.title, ruleId: input.ruleId, stage: input.stage, templateId: input.templateId, text: input.text, scheduledFor: new Date(input.scheduledFor), status: "pending" } });
      scheduled = toSchedule(row);
    } catch (error) { console.warn("schedule db fallback", error); scheduled = { ...input, id: id("line-schedule"), createdAt: new Date().toISOString(), status: "pending" }; getStore().unshift(scheduled); }
  } else {
    scheduled = { ...input, id: id("line-schedule"), createdAt: new Date().toISOString(), status: "pending" }; getStore().unshift(scheduled);
  }

  await recordLineAction({ applicantId: input.applicantId, lineUserId: input.lineUserId, friendId: input.friendId, type: "scheduled_message", label: `予約送信: ${input.title}`, detail: { templateId: input.templateId, scheduledFor: input.scheduledFor, stage: input.stage, ruleId: input.ruleId } });
  return scheduled;
}

export async function cancelScheduledLineMessage(scheduleId: string): Promise<ScheduledLineMessage | null> {
  if (dbAvailable()) {
    try {
      const row = await prisma.scheduledLineMessageRecord.update({
        where: { id: scheduleId },
        data: { status: "cancelled" },
      });
      const scheduled = toSchedule(row);
      await recordLineAction({
        applicantId: scheduled.applicantId,
        lineUserId: scheduled.lineUserId,
        friendId: scheduled.friendId,
        type: "scheduled_message",
        label: `予約取消: ${scheduled.title}`,
        detail: { scheduleId: scheduled.id, scheduledFor: scheduled.scheduledFor },
      });
      return scheduled;
    } catch (error) { console.warn("cancel schedule db fallback", error); }
  }

  const item = getStore().find((schedule) => schedule.id === scheduleId);
  if (!item) return null;
  item.status = "cancelled";
  await recordLineAction({ applicantId: item.applicantId, lineUserId: item.lineUserId, friendId: item.friendId, type: "scheduled_message", label: `予約取消: ${item.title}`, detail: { scheduleId: item.id, scheduledFor: item.scheduledFor } });
  return item;
}

export async function scheduleRuleMessagesForApplicant(baseUrl: string, applicant: LineApplicant, stage: FunnelStage) {
  const rules = (await getScheduledMessageRules(baseUrl)).filter((rule) => rule.enabled !== false && rule.trigger === "stage_entered" && rule.stage === stage);
  const settings = await getLineOperationalSettingsAsync(baseUrl);
  const templates = parseArray<Array<{ id: string; body: string }>[number]>(settings.messageTemplatesJson);
  const created: ScheduledLineMessage[] = [];
  for (const rule of rules) {
    await cancelExistingRuleSchedules(applicant.id, rule.id);
    const template = templates.find((item) => item.id === rule.templateId);
    created.push(await scheduleLineMessage({ applicantId: applicant.id, lineUserId: applicant.lineUserId, friendId: applicant.friendId, title: rule.title, ruleId: rule.id, stage, templateId: rule.templateId, text: template ? interpolate(template.body, applicant) : undefined, scheduledFor: addDelay(new Date(), Number(rule.delayAmount || 0), rule.delayUnit).toISOString() }));
  }
  return created;
}

export async function processDueScheduledMessages(baseUrl: string, now = new Date()) {
  const all = await listScheduledLineMessages();
  const due = all.filter((item) => item.status === "pending" && item.scheduledFor <= now.toISOString());
  const results: ScheduledLineMessage[] = [];

  for (const item of due) {
    const applicant = await getLineApplicant(item.applicantId) ?? { id: item.applicantId, lineUserId: item.lineUserId, friendId: item.friendId, currentStage: item.stage ?? "応募", source: "LINE", step: "submitted", createdAt: item.createdAt, updatedAt: item.createdAt, name: item.title, lastMessage: item.text } as LineApplicant;
    const log = item.templateId && !item.text
      ? await sendTemplateToApplicant(baseUrl, applicant, item.templateId, "scheduled")
      : item.text
        ? await sendLineMessageForApplicant(applicant, item.text, "scheduled", { templateId: item.templateId, stage: item.stage })
        : null;
    item.status = log?.status === "sent" || log?.status === "skipped" ? "sent" : "failed";
    item.sentAt = new Date().toISOString();
    item.error = log?.error;
    if (dbAvailable()) {
      try { await prisma.scheduledLineMessageRecord.update({ where: { id: item.id }, data: { status: item.status, sentAt: new Date(item.sentAt), error: item.error } }); } catch (error) { console.warn("schedule update db fallback", error); }
    }
    results.push(item);
  }
  return { processed: results.length, jobs: results };
}
