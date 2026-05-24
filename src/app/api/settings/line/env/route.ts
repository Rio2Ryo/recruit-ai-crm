import { NextResponse } from "next/server";

const editableEnv = [
  "LINE_CHANNEL_ACCESS_TOKEN",
  "LINE_CHANNEL_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "LINE_HARNESS_API_URL",
  "LINE_HARNESS_API_KEY",
  "LINE_HARNESS_WEBHOOK_SECRET",
  "LINE_HARNESS_APPLIED_TAG_ID",
] as const;

function getVercelContext() {
  const token = process.env.VERCEL_API_TOKEN ?? process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID ?? process.env.VERCEL_ORG_ID;

  return { token, projectId, teamId };
}

export async function GET() {
  const { token, projectId, teamId } = getVercelContext();

  return NextResponse.json({
    ok: true,
    writable: Boolean(token && projectId && teamId && (process.env.LINE_SETTINGS_ADMIN_KEY || process.env.LINE_CLI_ADMIN_KEY)),
    requiredServerEnv: ["LINE_SETTINGS_ADMIN_KEY or LINE_CLI_ADMIN_KEY", "VERCEL_API_TOKEN or VERCEL_TOKEN"],
    projectIdConfigured: Boolean(projectId),
    teamIdConfigured: Boolean(teamId),
    tokenConfigured: Boolean(token),
    editableEnv,
  });
}
