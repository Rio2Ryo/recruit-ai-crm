import { NextRequest, NextResponse } from "next/server";

function isAuthorized(request: NextRequest) {
  const adminKey = process.env.LINE_CLI_ADMIN_KEY;
  // Deny if LINE_CLI_ADMIN_KEY is not configured — open access would allow anyone to
  // push/broadcast LINE messages to real users.
  if (!adminKey) return false;
  return request.headers.get("x-admin-key") === adminKey;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: "LINE_CHANNEL_ACCESS_TOKEN is not set" }, { status: 500 });
  }

  const { to, text, broadcast = false } = await request.json();
  const endpoint = broadcast
    ? "https://api.line.me/v2/bot/message/broadcast"
    : "https://api.line.me/v2/bot/message/push";

  if (!broadcast && !to) {
    return NextResponse.json({ ok: false, error: "to is required for push message" }, { status: 400 });
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...(broadcast ? {} : { to }),
      messages: [{ type: "text", text }],
    }),
  });

  const detail = await response.text();
  return NextResponse.json({ ok: response.ok, status: response.status, detail }, { status: response.ok ? 200 : 502 });
}
