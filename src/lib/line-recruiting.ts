import { funnelStages, type FunnelStage } from "@/lib/recruiting-stages";

export type LineRecruitingStep = "welcome" | "job_select" | "profile" | "submitted";

export type LineAttachment = {
  id: string;
  lineUserId: string;
  messageId: string;
  type: "image" | "video" | "audio" | "file" | "unknown";
  fileName?: string;
  contentUrl?: string;
  storageKey?: string;
  storageUrl?: string;
  mimeType?: string;
  size?: number;
  savedAt: string;
};

export type LineMessageLog = {
  id: string;
  applicantId: string;
  lineUserId: string;
  friendId?: string;
  kind: "manual" | "step" | "auto" | "reply" | "scheduled";
  templateId?: string;
  stage?: FunnelStage;
  text: string;
  status: "sent" | "skipped" | "failed";
  result?: unknown;
  error?: string;
  createdAt: string;
};

export type LineActionEvent = {
  id: string;
  applicantId?: string;
  lineUserId: string;
  friendId?: string;
  type:
    | "follow"
    | "message"
    | "postback"
    | "form_view"
    | "form_submit"
    | "document_upload"
    | "message_send"
    | "step_send"
    | "scheduled_message"
    | "status_change";
  label: string;
  detail?: Record<string, unknown>;
  createdAt: string;
};

export type LineStepRun = {
  id: string;
  applicantId: string;
  lineUserId: string;
  friendId?: string;
  templateIds: string[];
  status: "completed" | "partial" | "failed";
  createdAt: string;
  logs: LineMessageLog[];
};

export type LineApplicant = {
  id: string;
  lineUserId: string;
  friendId?: string;
  displayName?: string;
  name?: string;
  school?: string;
  department?: string;
  phone?: string;
  email?: string;
  jobId?: string;
  jobTitle?: string;
  selfPr?: string;
  currentStage: FunnelStage;
  source: "LINE";
  step: LineRecruitingStep;
  createdAt: string;
  updatedAt: string;
  interviewAt?: string;
  feedback?: string;
  attachments?: LineAttachment[];
  messageLogs?: LineMessageLog[];
  actionEvents?: LineActionEvent[];
  stepRuns?: LineStepRun[];
  lastMessage?: string;
};

export const lineRecruitingStages = funnelStages;

export const lineRichMenuActions = [
  { label: "求人を見る", text: "求人" },
  { label: "応募する", text: "応募" },
  { label: "見学予約", text: "見学" },
  { label: "担当者に相談", text: "相談" },
];

export const lineApplyQuestions = [
  "氏名",
  "学校名",
  "学科",
  "希望職種",
  "電話番号",
  "メールアドレス",
  "自己PR・質問",
];

export function buildLineApplyUrl(baseUrl: string, lineUserId?: string) {
  const url = new URL("/line/apply", baseUrl);
  if (lineUserId) url.searchParams.set("lineUserId", lineUserId);
  return url.toString();
}

export function buildWelcomeMessage(baseUrl: string, lineUserId?: string) {
  return [
    "採用窓口です。",
    "LINEだけで求人確認・応募・日程連絡まで完結できます。",
    "応募フォームはこちら：",
    buildLineApplyUrl(baseUrl, lineUserId),
  ].join("\n");
}

export function buildJobsMessage(baseUrl: string, lineUserId?: string) {
  return [
    "現在、管理画面に登録済みの求人情報がありません。",
    "応募・問い合わせは以下のフォームから送信できます。担当者が内容を確認してご連絡します。",
    buildLineApplyUrl(baseUrl, lineUserId),
  ].join("\n");
}

export function classifyLineText(text: string): "apply" | "jobs" | "visit" | "consult" | "unknown" {
  const normalized = text.trim().toLowerCase();
  if (["応募", "エントリー", "apply"].some((word) => normalized.includes(word))) return "apply";
  if (["求人", "仕事", "募集", "job"].some((word) => normalized.includes(word))) return "jobs";
  if (["見学", "会社見学", "visit"].some((word) => normalized.includes(word))) return "visit";
  if (["相談", "質問", "問い合わせ", "問合せ"].some((word) => normalized.includes(word))) return "consult";
  return "unknown";
}

export function buildAutoReply(text: string, baseUrl: string, lineUserId?: string) {
  const intent = classifyLineText(text);

  switch (intent) {
    case "apply":
      return buildWelcomeMessage(baseUrl, lineUserId);
    case "jobs":
      return buildJobsMessage(baseUrl, lineUserId);
    case "visit":
      return [
        "会社見学の希望ありがとうございます。",
        "応募フォームの『自己PR・質問』欄に希望日時を書いて送ってください。担当者からLINEでご連絡します。",
        buildLineApplyUrl(baseUrl, lineUserId),
      ].join("\n");
    case "consult":
      return "担当者に確認してLINEで返信します。学校名・お名前・質問内容を続けて送ってください。";
    default:
      return [
        "メニューから選んでください。",
        "・求人を見る →『求人』",
        "・応募する →『応募』",
        "・会社見学 →『見学』",
        "・相談 →『相談』",
      ].join("\n");
  }
}

export function createLineApplicant(input: Partial<LineApplicant> & { lineUserId: string }): LineApplicant {
  const now = new Date().toISOString();
  return {
    id: input.id ?? `line-${Date.now()}`,
    lineUserId: input.lineUserId,
    friendId: input.friendId,
    displayName: input.displayName,
    name: input.name,
    school: input.school,
    department: input.department,
    phone: input.phone,
    email: input.email,
    jobId: input.jobId,
    jobTitle: input.jobTitle,
    selfPr: input.selfPr,
    currentStage: input.currentStage ?? "応募",
    source: "LINE",
    step: input.step ?? "submitted",
    createdAt: input.createdAt ?? now,
    updatedAt: now,
    interviewAt: input.interviewAt,
    feedback: input.feedback,
    attachments: input.attachments ?? [],
    messageLogs: input.messageLogs ?? [],
    actionEvents: input.actionEvents ?? [],
    stepRuns: input.stepRuns ?? [],
    lastMessage: input.lastMessage,
  };
}
