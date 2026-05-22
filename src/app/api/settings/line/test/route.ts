import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL ?? `${request.nextUrl.protocol}//${request.nextUrl.host}`;
}

function maskError(error: unknown) {
  return error instanceof Error ? error.message.replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [REDACTED]") : "unknown error";
}

function signBody(body: string) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) return null;
  return crypto.createHmac("sha256", secret).update(body).digest("base64");
}

function isAuthorized(request: NextRequest) {
  const adminKey = process.env.LINE_SETTINGS_ADMIN_KEY ?? process.env.LINE_CLI_ADMIN_KEY;
  if (!adminKey) return false;
  return request.headers.get("x-admin-key") === adminKey;
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const required = ["LINE_CHANNEL_ACCESS_TOKEN", "LINE_CHANNEL_SECRET", "NEXT_PUBLIC_APP_URL"];
  const env = Object.fromEntries(required.map((name) => [name, Boolean(process.env[name]?.trim())]));

  return NextResponse.json({
    ok: true,
    baseUrl,
    env,
    urls: {
      webhook: `${baseUrl}/api/line/webhook`,
      apply: `${baseUrl}/line/apply`,
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
  const baseUrl = getBaseUrl(request);

  if (input.action === "webhook-self-test") {
    const body = JSON.stringify({
      events: [
        {
          type: "message",
          replyToken: "test-reply-token",
          source: { type: "user", userId: "line-settings-test-user" },
          message: { type: "text", text: "応募" },
        },
      ],
    });
    const signature = signBody(body);

    const response = await fetch(`${baseUrl}/api/line/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(signature ? { "x-line-signature": signature } : {}),
      },
      body,
    });

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      detail: await response.text(),
      note: "LINEの実replyTokenではないため、アクセストークン設定済み環境ではreply APIが失敗する場合があります。署名・受信経路の確認用です。",
    });
  }

  if (input.action === "push-test") {
    if (!input.to || !input.text) {
      return NextResponse.json({ ok: false, error: "to and text are required" }, { status: 400 });
    }

    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json({ ok: false, error: "LINE_CHANNEL_ACCESS_TOKEN is not set" }, { status: 500 });
    }

    try {
      const response = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: input.to,
          messages: [{ type: "text", text: input.text }],
        }),
      });

      return NextResponse.json({ ok: response.ok, status: response.status, detail: await response.text() }, { status: response.ok ? 200 : 502 });
    } catch (error) {
      return NextResponse.json({ ok: false, error: maskError(error) }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: false, error: "unknown action" }, { status: 400 });
}
