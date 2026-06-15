import { NextRequest, NextResponse } from "next/server";
import { getLineHarnessClient } from "@/lib/line-harness";

function isAuthorized(request: NextRequest) {
  const adminKey = process.env.LINE_CLI_ADMIN_KEY;
  if (!adminKey) return false;
  return request.headers.get("x-admin-key") === adminKey;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const client = getLineHarnessClient();
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "LINE_HARNESS_API_URL and LINE_HARNESS_API_KEY are required" },
      { status: 500 }
    );
  }

  const { friendId, text, messageType = "text" } = await request.json();
  if (!friendId || !text) {
    return NextResponse.json({ ok: false, error: "friendId and text are required" }, { status: 400 });
  }

  const result = await client.sendMessage(friendId, text, messageType);
  return NextResponse.json({ ok: true, result });
}
