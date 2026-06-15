import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { addLineAttachment, recordLineAction, saveLineApplicant } from "@/lib/line-applicant-store";
import { saveLineDocumentBytes } from "@/lib/line-document-storage";
import { buildAutoReply } from "@/lib/line-recruiting";

type LineMessageEvent = {
  type: "message";
  replyToken: string;
  source: { userId?: string; type: string };
  message: {
    id?: string;
    type: string;
    text?: string;
    fileName?: string;
    contentProvider?: { type?: string; originalContentUrl?: string };
  };
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
  if (!channelSecret) return false;
  if (!signature) return false;

  const expected = crypto.createHmac("sha256", channelSecret).update(body).digest("base64");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

async function saveLineContent(lineUserId: string, messageId: string, fileName?: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set; cannot download LINE attachment content");

  const response = await fetch(`https://api-data.line.me/v2/bot/message/${messageId}/content`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`LINE content download failed: ${response.status} ${detail}`);
  }

  const mimeType = response.headers.get("content-type") ?? undefined;
  const bytes = Buffer.from(await response.arrayBuffer());
  return saveLineDocumentBytes({ lineUserId, messageId, fileName, mimeType, bytes });
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
      if (userId) {
        const applicant = await saveLineApplicant({ lineUserId: userId, currentStage: "LINE流入", step: "welcome" });
        await recordLineAction({ applicantId: applicant.id, lineUserId: applicant.lineUserId, type: "follow", label: "友だち追加" });
      }
      await replyText(event.replyToken, buildAutoReply("応募", baseUrl, userId));
      handled.push("follow");
      continue;
    }

    if (event.type === "message" && event.replyToken) {
      const messageEvent = event as LineMessageEvent;
      if (messageEvent.message.type !== "text") {
        if (userId) {
          const messageId = messageEvent.message.id ?? `line-message-${Date.now()}`;
          const stored = await saveLineContent(userId, messageId, messageEvent.message.fileName);
          await addLineAttachment(userId, {
            messageId,
            type: ["image", "video", "audio", "file"].includes(messageEvent.message.type)
              ? (messageEvent.message.type as "image" | "video" | "audio" | "file")
              : "unknown",
            fileName: messageEvent.message.fileName,
            contentUrl: messageEvent.message.contentProvider?.originalContentUrl,
            storageKey: stored?.storageKey,
            storageUrl: stored?.storageUrl,
            mimeType: stored?.mimeType,
            size: stored?.size,
          });
        }
        await replyText(
          messageEvent.replyToken,
          "履歴書・応募書類を受け付けました。採用担当が候補者情報に紐づけて確認します。"
        );
        handled.push("attachment");
        continue;
      }
      const text = messageEvent.message.text ?? "";
      if (userId) {
        const applicant = await saveLineApplicant({ lineUserId: userId, currentStage: text.includes("応募") ? "応募" : "LINE流入", lastMessage: text });
        await recordLineAction({ applicantId: applicant.id, lineUserId: applicant.lineUserId, type: "message", label: text, detail: { intent: text.includes("応募") ? "apply" : "message" } });
      }
      await replyText(messageEvent.replyToken, buildAutoReply(text, baseUrl, userId));
      handled.push("message");
      continue;
    }

    if (event.type === "postback" && event.replyToken) {
      const postbackEvent = event as LinePostbackEvent;
      if (userId) {
        const applicant = await saveLineApplicant({ lineUserId: userId, currentStage: "LINE流入", lastMessage: postbackEvent.postback.data });
        await recordLineAction({ applicantId: applicant.id, lineUserId: applicant.lineUserId, type: "postback", label: postbackEvent.postback.data });
      }
      await replyText(postbackEvent.replyToken, buildAutoReply(postbackEvent.postback.data, baseUrl, userId));
      handled.push("postback");
    }
  }

  return NextResponse.json({ ok: true, handled });
}
