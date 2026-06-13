import { NextRequest, NextResponse } from "next/server";
import {
  getLineOperationalSettingsAsync,
  saveLineOperationalSettingsAsync,
  type LineOperationalSettings,
} from "@/lib/line-settings-store";

const editableFields: Array<keyof LineOperationalSettings> = [
  "officialAccountName",
  "officialAccountManagerUrl",
  "addFriendUrl",
  "richMenuApplyUrl",
  "harnessDashboardUrl",
  "harnessFormUrl",
  "defaultApplyMessage",
  "testFriendId",
  "stageTagMapJson",
  "messageTemplatesJson",
  "scheduledMessageRulesJson",
  "automationRulesJson",
  "richMenuPlanJson",
  "broadcastDraftsJson",
];

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL ?? `${request.nextUrl.protocol}//${request.nextUrl.host}`;
}

function isAuthorized(request: NextRequest) {
  const adminKey = process.env.LINE_SETTINGS_ADMIN_KEY ?? process.env.LINE_CLI_ADMIN_KEY;
  if (!adminKey) return false;
  return request.headers.get("x-admin-key") === adminKey;
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    ok: true,
    settings: await getLineOperationalSettingsAsync(getBaseUrl(request)),
  });
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const input = (await request.json().catch(() => ({}))) as Partial<LineOperationalSettings>;
  const sanitized = Object.fromEntries(
    editableFields
      .filter((field) => typeof input[field] === "string")
      .map((field) => [field, input[field]?.trim() ?? ""])
  ) as Partial<LineOperationalSettings>;

  return NextResponse.json({
    ok: true,
    settings: await saveLineOperationalSettingsAsync(getBaseUrl(request), sanitized),
  });
}
