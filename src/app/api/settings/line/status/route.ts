import { NextResponse } from "next/server";

const requiredEnv = [
  "LINE_CHANNEL_ACCESS_TOKEN",
  "LINE_CHANNEL_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "LINE_HARNESS_API_URL",
  "LINE_HARNESS_API_KEY",
  "LINE_HARNESS_WEBHOOK_SECRET",
] as const;

const optionalEnv = ["LINE_HARNESS_APPLIED_TAG_ID"] as const;

function isConfigured(name: string) {
  return Boolean(process.env[name]?.trim());
}

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://recruit-ai-crm.vercel.app";

  return NextResponse.json({
    ok: true,
    appUrl: {
      value: appUrl,
      configured: isConfigured("NEXT_PUBLIC_APP_URL"),
    },
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
