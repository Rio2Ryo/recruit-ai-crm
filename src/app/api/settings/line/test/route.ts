import { NextRequest, NextResponse } from "next/server";
import { getLineHarnessClient } from "@/lib/line-harness";

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

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const required = [
    "NEXT_PUBLIC_APP_URL",
    "LINE_HARNESS_API_URL",
    "LINE_HARNESS_API_KEY",
    "LINE_HARNESS_WEBHOOK_SECRET",
  ];
  const env = Object.fromEntries(required.map((name) => [name, Boolean(process.env[name]?.trim())]));

  return NextResponse.json({
    ok: true,
    baseUrl,
    env,
    urls: {
      webhook: `${baseUrl}/api/line/webhook`,
      apply: `${baseUrl}/line/apply`,
      applicants: `${baseUrl}/api/line/applicants`,
      harnessSubmission: `${baseUrl}/api/integrations/line-harness/submission`,
      harnessSend: `${baseUrl}/api/integrations/line-harness/send`,
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

  if (input.action === "harness-status") {
    const client = getLineHarnessClient();
    if (!client) {
      return NextResponse.json(
        { ok: false, error: "LINE_HARNESS_API_URL and LINE_HARNESS_API_KEY are required" },
        { status: 500 }
      );
    }

    try {
      const friends = await client.listFriends({ limit: 1 });
      return NextResponse.json({
        ok: true,
        status: 200,
        detail: JSON.stringify(
          {
            total: friends.total,
            sampleCount: friends.items?.length ?? 0,
            hasNextPage: friends.hasNextPage,
          },
          null,
          2
        ),
      });
    } catch (error) {
      return NextResponse.json({ ok: false, error: maskError(error) }, { status: 502 });
    }
  }

  if (input.action === "webhook-self-test") {
    const body = JSON.stringify({
      submission: {
        id: `line-settings-test-${Date.now()}`,
        formId: "settings-self-test",
        friendId: "settings-test-friend",
        lineUserId: "settings-test-line-user",
        submittedAt: new Date().toISOString(),
        data: {
          name: "LINE設定テスト",
          school: "テスト高校",
          department: "設定確認",
          jobTitle: "設定確認",
          selfPr: "LINE Harness submission webhook self-test",
        },
      },
    });

    const response = await fetch(`${baseUrl}/api/integrations/line-harness/submission`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.LINE_HARNESS_WEBHOOK_SECRET
          ? { "x-line-harness-secret": process.env.LINE_HARNESS_WEBHOOK_SECRET }
          : {}),
      },
      body,
    });

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      detail: await response.text(),
      note: "Harness submission webhookの受信・保存経路を確認します。外部送信は行いません。",
    });
  }

  if (input.action === "push-test") {
    if (!input.to || !input.text) {
      return NextResponse.json({ ok: false, error: "to and text are required" }, { status: 400 });
    }

    const client = getLineHarnessClient();
    if (!client) {
      return NextResponse.json(
        { ok: false, error: "LINE_HARNESS_API_URL and LINE_HARNESS_API_KEY are required" },
        { status: 500 }
      );
    }

    try {
      const result = await client.sendMessage(input.to, input.text);
      return NextResponse.json({ ok: true, status: 200, detail: JSON.stringify(result, null, 2) });
    } catch (error) {
      return NextResponse.json({ ok: false, error: maskError(error) }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: false, error: "unknown action" }, { status: 400 });
}
