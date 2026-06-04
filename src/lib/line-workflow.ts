import "server-only";
import { getLineHarnessClient } from "@/lib/line-harness";
import { getLineOperationalSettingsAsync } from "@/lib/line-settings-store";
import type { FunnelStage } from "@/lib/demo-data";
import type { LineApplicant, LineMessageLog } from "@/lib/line-recruiting";
import { addLineMessageLog, addLineStepRun } from "@/lib/line-applicant-store";

export type MessageTemplate = {
  id: string;
  title: string;
  body: string;
  stage?: FunnelStage;
  enabled?: boolean;
};

export type StageTagRule = {
  stage: FunnelStage;
  tagName?: string;
  tagId?: string;
  autoApply?: boolean;
  templateId?: string;
  autoSend?: boolean;
};

function parseArray<T>(value: string | undefined): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function interpolate(text: string, applicant: LineApplicant) {
  return text
    .replaceAll("{{name}}", applicant.name ?? applicant.displayName ?? "応募者")
    .replaceAll("{{school}}", applicant.school ?? "学校名未入力")
    .replaceAll("{{jobTitle}}", applicant.jobTitle ?? "希望職種未定")
    .replaceAll("{{stage}}", applicant.currentStage)
    .replaceAll("{{url}}", "");
}

export async function getLineWorkflowConfig(baseUrl: string) {
  const settings = await getLineOperationalSettingsAsync(baseUrl);
  const templates = parseArray<MessageTemplate>(settings.messageTemplatesJson);
  const stageRules = parseArray<StageTagRule>(settings.stageTagMapJson);
  return { settings, templates, stageRules };
}

async function sendDirectLineMessage(to: string, text: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");
  }

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to,
      messages: [{ type: "text", text }],
    }),
  });

  const detail = await response.text();
  if (!response.ok) {
    throw new Error(`LINE direct push failed: ${response.status} ${detail}`);
  }
  return { provider: "line-direct", status: response.status, detail };
}

export async function sendLineMessageForApplicant(
  applicant: LineApplicant,
  text: string,
  kind: LineMessageLog["kind"],
  options: { templateId?: string; stage?: FunnelStage } = {}
) {
  const friendId = applicant.friendId ?? applicant.lineUserId;
  const client = getLineHarnessClient();

  try {
    const result = client
      ? await client.sendMessage(friendId, text)
      : await sendDirectLineMessage(applicant.lineUserId, text);

    return addLineMessageLog({
      applicantId: applicant.id,
      lineUserId: applicant.lineUserId,
      friendId,
      kind,
      templateId: options.templateId,
      stage: options.stage,
      text,
      status: "sent",
      result,
    });
  } catch (error) {
    return addLineMessageLog({
      applicantId: applicant.id,
      lineUserId: applicant.lineUserId,
      friendId,
      kind,
      templateId: options.templateId,
      stage: options.stage,
      text,
      status: client || process.env.LINE_CHANNEL_ACCESS_TOKEN ? "failed" : "skipped",
      error: error instanceof Error ? error.message : "send failed",
    });
  }
}

export async function sendTemplateToApplicant(baseUrl: string, applicant: LineApplicant, templateId: string, kind: LineMessageLog["kind"] = "manual") {
  const { templates } = await getLineWorkflowConfig(baseUrl);
  const template = templates.find((item) => item.id === templateId) ?? templates[0];
  if (!template) {
    return addLineMessageLog({
      applicantId: applicant.id,
      lineUserId: applicant.lineUserId,
      friendId: applicant.friendId ?? applicant.lineUserId,
      kind,
      templateId,
      text: "",
      status: "failed",
      error: "template not found",
    });
  }
  return sendLineMessageForApplicant(applicant, interpolate(template.body, applicant), kind, { templateId: template.id, stage: template.stage });
}

export async function sendStepMessages(baseUrl: string, applicant: LineApplicant, templateIds?: string[]) {
  const { templates } = await getLineWorkflowConfig(baseUrl);
  const ids = templateIds?.length ? templateIds : templates.map((item) => item.id);
  const logs = [];

  for (const templateId of ids) {
    logs.push(await sendTemplateToApplicant(baseUrl, applicant, templateId, "step"));
  }

  const status = logs.every((log) => log.status === "sent" || log.status === "skipped")
    ? "completed"
    : logs.some((log) => log.status === "sent" || log.status === "skipped")
      ? "partial"
      : "failed";

  return addLineStepRun({
    applicantId: applicant.id,
    lineUserId: applicant.lineUserId,
    friendId: applicant.friendId ?? applicant.lineUserId,
    templateIds: ids,
    status,
    logs,
  });
}

export async function runStageAutomation(baseUrl: string, applicant: LineApplicant, stage: FunnelStage) {
  const { stageRules, templates } = await getLineWorkflowConfig(baseUrl);
  const rule = stageRules.find((item) => item.stage === stage);
  if (!rule?.autoSend && !rule?.templateId) return null;

  const fallbackTemplate = templates.find((item) => item.stage === stage) ?? templates.find((item) => item.id.includes("interview"));
  const templateId = rule.templateId || fallbackTemplate?.id;
  if (!templateId) return null;
  return sendTemplateToApplicant(baseUrl, { ...applicant, currentStage: stage }, templateId, "auto");
}
