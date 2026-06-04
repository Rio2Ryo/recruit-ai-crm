import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const requiredEnv = [
  "NEXT_PUBLIC_APP_URL",
  "LINE_HARNESS_API_URL",
  "LINE_HARNESS_API_KEY",
  "LINE_HARNESS_WEBHOOK_SECRET",
  "DATABASE_URL",
] as const;

const optionalEnv = [
  "LINE_HARNESS_APPLIED_TAG_ID",
  "LINE_HARNESS_TIMEOUT_MS",
  "LINE_CHANNEL_ACCESS_TOKEN",
  "LINE_CHANNEL_SECRET",
  "CRON_SECRET",
] as const;

function isConfigured(name: string) {
  return Boolean(process.env[name]?.trim());
}

function sanitizeDbError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("authentication")) return "DB authentication failed. DATABASE_URLのユーザー/パスワードを確認してください。";
  if (message.includes("does not exist")) return "DB tables are missing. Supabase SQL Editorでschema SQLを実行してください。";
  if (message.includes("ECIRCUITBREAKER")) return "DB authentication failures are temporarily blocked by Supabase/Pooler. DATABASE_URL修正後、少し待って再確認してください。";
  return message.slice(0, 240);
}

async function getDbHealth() {
  if (!isConfigured("DATABASE_URL")) return { configured: false, ok: false, error: "DATABASE_URL is empty" };
  try {
    const [applicants, actions, messages, documents, schedules] = await Promise.all([
      prisma.lineApplicantRecord.count(),
      prisma.lineActionEventRecord.count(),
      prisma.lineMessageLogRecord.count(),
      prisma.lineDocumentRecord.count(),
      prisma.scheduledLineMessageRecord.count(),
    ]);
    return { configured: true, ok: true, counts: { applicants, actions, messages, documents, schedules } };
  } catch (error) {
    return { configured: true, ok: false, error: sanitizeDbError(error) };
  }
}

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://recruit-ai-crm.vercel.app";

  return NextResponse.json({
    ok: true,
    appUrl: {
      value: appUrl,
      configured: isConfigured("NEXT_PUBLIC_APP_URL"),
    },
    db: await getDbHealth(),
    env: [
      ...requiredEnv.map((name) => ({
        name,
        configured: isConfigured(name),
      })),
      ...optionalEnv.map((name) => ({
        name,
        configured: isConfigured(name),
        optional: true,
      })),
    ],
  });
}
