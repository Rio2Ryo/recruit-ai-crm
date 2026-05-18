import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildAutoReply, createLineApplicant } from "@/lib/line-recruiting";

type LineMessageEvent = {
  type: "message";
  replyToken: string;
  source: { userId?: string; type: string };
  message: { type: string; text?: string };
};

type LineFollowEvent = {
  type: "follow";
  replyToken: string;
  source: { userId?: string; type: string };
};

type LinePostbackEvent = {
  type: "postback";
  replyToken: string;
  source: { userId?: string; type: string };
  postback: { data: string };
};

type LineEvent = LineMessageEvent | LineFollowEvent | LinePostbackEvent | { type: string; replyToken?: string; source?: { userId?: string } };

function getBaseUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL ?? `${request.nextUrl.protocol}//${request.nextUrl.host}`;
}

function verifySignature(body: string, signature: string | null) {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret) return true;
  if (!signature) return false;

  const expected = crypto.createHmac("sha256", channelSecret).update(body).digest("base64");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

async function replyText(replyToken: string, text: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    console.warn("LINE_CHANNEL_ACCESS_TOKEN is not set; reply skipped.");
    return;
  }

  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`LINE reply failed: ${response.status} ${detail}`);
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    name: "Recruit AI CRM LINE webhook",
    requiredEnv: ["LINE_CHANNEL_ACCESS_TOKEN", "LINE_CHANNEL_SECRET", "NEXT_PUBLIC_APP_URL"],
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body) as { events?: LineEvent[] };
  const baseUrl = getBaseUrl(request);
  const handled: string[] = [];

  for (const event of payload.events ?? []) {
    const userId = event.source?.userId;

    if (event.type === "follow" && event.replyToken) {
      createLineApplicant({ lineUserId: userId ?? "unknown", currentStage: "LINE流入", step: "welcome" });
      await replyText(event.replyToken, buildAutoReply("応募", baseUrl, userId));
      handled.push("follow");
      continue;
    }

    if (event.type === "message" && event.replyToken) {
      const messageEvent = event as LineMessageEvent;
      if (messageEvent.message.type !== "text") continue;
      const text = messageEvent.message.text ?? "";
      createLineApplicant({ lineUserId: userId ?? "unknown", currentStage: text.includes("応募") ? "応募" : "LINE流入", lastMessage: text });
      await replyText(messageEvent.replyToken, buildAutoReply(text, baseUrl, userId));
      handled.push("message");
      continue;
    }

    if (event.type === "postback" && event.replyToken) {
      const postbackEvent = event as LinePostbackEvent;
      await replyText(postbackEvent.replyToken, buildAutoReply(postbackEvent.postback.data, baseUrl, userId));
      handled.push("postback");
    }
  }

  return NextResponse.json({ ok: true, handled });
}
