import type { NextRequest } from "next/server";
import type { LineApplicant } from "@/lib/line-recruiting";

export const recruitingPermissions = [
  "basic:name",
  "basic:department",
  "basic:email",
  "admin",
  "resume:history",
  "resume:motivation",
  "personal:phone",
  "personal:location",
  "personal:address",
  "personal:email",
  "status:view",
  "status:update",
  "tag:add",
  "block:manage",
  "message:view",
  "template:create",
  "message:send:1to1",
  "message:send:broadcast",
  "schedule:view",
  "schedule:manage",
  "schedule:book",
] as const;

export type RecruitingPermission = (typeof recruitingPermissions)[number];

export type RecruitingRoleId =
  | "executive"
  | "recruiting_lead"
  | "assistant_line"
  | "assistant_screening"
  | "assistant_scheduler"
  | "assistant_progress"
  | "legal"
  | "interviewer";

export type RecruitingRoleDefinition = {
  id: RecruitingRoleId;
  label: string;
  description: string;
  permissions: RecruitingPermission[];
};

const allPermissions = [...recruitingPermissions];

export const permissionGroups: {
  label: string;
  permissions: { key: RecruitingPermission; label: string }[];
}[] = [
  {
    label: "基本情報",
    permissions: [
      { key: "basic:name", label: "名前" },
      { key: "basic:department", label: "部署" },
      { key: "basic:email", label: "メールアドレス" },
      { key: "admin", label: "管理者" },
    ],
  },
  {
    label: "履歴書",
    permissions: [
      { key: "resume:history", label: "学/経歴" },
      { key: "resume:motivation", label: "動機など" },
    ],
  },
  {
    label: "個人情報",
    permissions: [
      { key: "personal:phone", label: "電話番号" },
      { key: "personal:location", label: "居住県/市" },
      { key: "personal:address", label: "詳細住所" },
      { key: "personal:email", label: "メアド" },
    ],
  },
  {
    label: "ステータス",
    permissions: [
      { key: "status:view", label: "ステータス閲覧" },
      { key: "status:update", label: "ステータス変更" },
      { key: "tag:add", label: "タグ追加" },
      { key: "block:manage", label: "ブロック/解除" },
    ],
  },
  {
    label: "メッセージ/やりとり",
    permissions: [
      { key: "message:view", label: "個別メッセ閲覧" },
      { key: "template:create", label: "テンプレ作成" },
      { key: "message:send:1to1", label: "1対1メッセ送信" },
      { key: "message:send:broadcast", label: "一斉送信" },
    ],
  },
  {
    label: "日程調整",
    permissions: [
      { key: "schedule:view", label: "予約閲覧" },
      { key: "schedule:manage", label: "イベント/枠管理" },
      { key: "schedule:book", label: "予約管理" },
    ],
  },
];

export const roleDefinitions: RecruitingRoleDefinition[] = [
  {
    id: "executive",
    label: "代表取締役/役員レベル/総務部長",
    description: "管理者あり。ユーザー管理を含む全機能を利用できます。",
    permissions: allPermissions,
  },
  {
    id: "recruiting_lead",
    label: "採用リーダー/採用責任者",
    description: "管理者権限以外の採用運用、個人情報、LINE送信を扱えます。",
    permissions: allPermissions.filter((permission) => permission !== "admin"),
  },
  {
    id: "assistant_line",
    label: "アシスタントA/LINE配信担当者",
    description: "応募者とのLINEやりとり、配信、分類タグ、基本的な選考更新を扱えます。",
    permissions: [
      "resume:history",
      "resume:motivation",
      "personal:location",
      "status:view",
      "status:update",
      "tag:add",
      "block:manage",
      "message:view",
      "template:create",
      "message:send:1to1",
      "message:send:broadcast",
      "schedule:view",
      "schedule:book",
    ],
  },
  {
    id: "assistant_screening",
    label: "アシスタントB/書類選考担当",
    description: "履歴書確認、住所市区町村/詳細住所、ステータス更新、タグ追加を扱えます。",
    permissions: [
      "resume:history",
      "resume:motivation",
      "personal:location",
      "personal:address",
      "status:view",
      "status:update",
      "tag:add",
      "message:view",
      "schedule:view",
    ],
  },
  {
    id: "assistant_scheduler",
    label: "アシスタントC/面接日程調整担当",
    description: "電話番号を使った日程調整、予約枠管理、ステータス更新を扱えます。",
    permissions: [
      "resume:history",
      "resume:motivation",
      "personal:phone",
      "personal:location",
      "status:view",
      "status:update",
      "tag:add",
      "message:view",
      "schedule:view",
      "schedule:manage",
      "schedule:book",
    ],
  },
  {
    id: "assistant_progress",
    label: "アシスタントD/集計担当/進捗管理",
    description: "進捗確認、ステータス更新、タグ追加、メッセージ履歴確認を扱えます。",
    permissions: [
      "resume:history",
      "resume:motivation",
      "personal:location",
      "status:view",
      "status:update",
      "tag:add",
      "message:view",
      "schedule:view",
    ],
  },
  {
    id: "legal",
    label: "法務",
    description: "個人情報と履歴書、メッセージ履歴を閲覧できます。変更・送信はできません。",
    permissions: [
      "resume:history",
      "resume:motivation",
      "personal:phone",
      "personal:location",
      "personal:address",
      "personal:email",
      "status:view",
      "message:view",
      "schedule:view",
    ],
  },
  {
    id: "interviewer",
    label: "面接官（他部署など面接のみ担当する人）",
    description: "面接に必要な履歴書、住所市区町村/詳細住所、ステータス、メッセージ履歴を閲覧できます。",
    permissions: [
      "resume:history",
      "resume:motivation",
      "personal:location",
      "personal:address",
      "status:view",
      "message:view",
      "schedule:view",
    ],
  },
];

export function getRoleDefinition(roleId?: string | null) {
  return roleDefinitions.find((role) => role.id === roleId) ?? roleDefinitions[0];
}

export function getRoleFromRequest(request: NextRequest) {
  return getRoleDefinition(
    request.headers.get("x-rbac-role") ?? request.nextUrl.searchParams.get("role")
  );
}

export function hasPermission(roleId: string | null | undefined, permission: RecruitingPermission) {
  return getRoleDefinition(roleId).permissions.includes(permission);
}

export function roleHasPermission(role: RecruitingRoleDefinition, permission: RecruitingPermission) {
  return role.permissions.includes(permission);
}

export function maskRestrictedValue(value: string | null | undefined) {
  return value ? "非表示" : undefined;
}

export function maskLineApplicant(applicant: LineApplicant, roleId: string | null | undefined): LineApplicant {
  const role = getRoleDefinition(roleId);
  const can = (permission: RecruitingPermission) => roleHasPermission(role, permission);

  return {
    ...applicant,
    phone: can("personal:phone") ? applicant.phone : maskRestrictedValue(applicant.phone),
    email: can("personal:email") ? applicant.email : maskRestrictedValue(applicant.email),
    currentStage: applicant.currentStage,
    selfPr: can("resume:motivation") ? applicant.selfPr : maskRestrictedValue(applicant.selfPr),
    attachments: can("resume:history") ? applicant.attachments : [],
    lastMessage: can("message:view") ? applicant.lastMessage : maskRestrictedValue(applicant.lastMessage),
    messageLogs: can("message:view") ? applicant.messageLogs : [],
    actionEvents: can("status:view") ? applicant.actionEvents : [],
  };
}
