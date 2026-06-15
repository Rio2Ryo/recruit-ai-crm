import { NextRequest, NextResponse } from "next/server";

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL ?? `${request.nextUrl.protocol}//${request.nextUrl.host}`;
}

function maskError(error: unknown) {
  return error instanceof Error ? error.message.replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [REDACTED]") : "unknown error";
}

function isAuthorized(request: NextRequest) {
  const adminKey = process.env.LINE_SETTINGS_ADMIN_KEY ?? process.env.LINE_CLI_ADMIN_KEY;
  if (!adminKey) return false;
  return request.headers.get("x-admin-key") === adminKey;
}

async function pushDirectLineMessage(to: string, text: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is required");

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, messages: [{ type: "text", text }] }),
  });

  const detail = await response.text();
  if (!response.ok) throw new Error(`LINE push failed: ${response.status} ${detail}`);
  return { provider: "line-direct", status: response.status, detail };
}

export async function GET(request: NextRequest) {
  const sessionEmail = request.cookies.get("recruit-ai-session-email")?.value?.trim();
  if (!sessionEmail) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const baseUrl = getBaseUrl(request);
  const required = ["NEXT_PUBLIC_APP_URL", "DATABASE_URL"];
  const optional = ["LINE_CHANNEL_ACCESS_TOKEN", "LINE_CHANNEL_SECRET", "CRON_SECRET"];
  const env = Object.fromEntries([...required, ...optional].map((name) => [name, Boolean(process.env[name]?.trim())]));

  return NextResponse.json({
    ok: true,
    baseUrl,
    env,
    urls: {
      webhook: `${baseUrl}/api/line/webhook`,
      apply: `${baseUrl}/line/apply`,
      schedule: `${baseUrl}/schedule`,
      applicants: `${baseUrl}/api/line/applicants`,
    },
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized", message: "送信系テストには管理キーが必要です。" },
      { status: 401 }
    );
  }

  const input = (await request.json().catch(() => ({}))) as { action?: string; to?: string; text?: string };

  if (input.action === "push-test") {
    if (!input.to || !input.text) {
      return NextResponse.json({ ok: false, error: "to and text are required" }, { status: 400 });
    }

    try {
      const result = await pushDirectLineMessage(input.to, input.text);
      return NextResponse.json({ ok: true, status: 200, detail: JSON.stringify(result, null, 2) });
    } catch (error) {
      return NextResponse.json({ ok: false, error: maskError(error) }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: false, error: "unknown action" }, { status: 400 });
}
