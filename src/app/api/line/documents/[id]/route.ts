import { NextRequest, NextResponse } from "next/server";
import { listLineApplicants } from "@/lib/line-applicant-store";
import { loadLineDocumentBytes, saveLineDocumentBytes } from "@/lib/line-document-storage";
import { prisma } from "@/lib/prisma";

function documentResponse(input: { bytes: Buffer; mimeType?: string; fileName?: string; download: boolean }) {
  const disposition = input.download ? "attachment" : "inline";
  return new Response(new Uint8Array(input.bytes), {
    headers: {
      "Content-Type": input.mimeType ?? "application/octet-stream",
      "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(input.fileName ?? "line-document")}`,
      "Cache-Control": "private, max-age=60",
    },
  });
}

async function recoverLineDocumentFromLineContent(attachment: {
  id: string;
  lineUserId: string;
  messageId: string;
  fileName?: string;
  mimeType?: string;
}) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return null;

  const response = await fetch(`https://api-data.line.me/v2/bot/message/${attachment.messageId}/content`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;

  const mimeType = response.headers.get("content-type") ?? attachment.mimeType ?? "application/octet-stream";
  const bytes = Buffer.from(await response.arrayBuffer());
  const stored = await saveLineDocumentBytes({
    lineUserId: attachment.lineUserId,
    messageId: attachment.messageId,
    fileName: attachment.fileName,
    mimeType,
    bytes,
  });

  if (process.env.DATABASE_URL) {
    await prisma.lineDocumentRecord.update({
      where: { id: attachment.id },
      data: {
        storageKey: JSON.stringify({ storagePath: stored.storageKey, type: mimeType.startsWith("image/") ? "image" : "file" }),
        storageUrl: stored.storageUrl,
        mimeType: stored.mimeType,
        size: stored.size,
      },
    });
  }

  return { bytes, mimeType: stored.mimeType, fileName: attachment.fileName };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionEmail = request.cookies.get("recruit-ai-session-email")?.value?.trim();
  if (!sessionEmail) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const attachment = (await listLineApplicants())
    .flatMap((applicant) => applicant.attachments ?? [])
    .find((item) => item.id === id || item.messageId === id);

  if (!attachment) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  const download = request.nextUrl.searchParams.get("download") === "1";

  if (!attachment.storageKey) {
    const recovered = await recoverLineDocumentFromLineContent(attachment);
    if (recovered) return documentResponse({ ...recovered, download });
    return NextResponse.json({ ok: false, error: "stored file not found" }, { status: 404 });
  }

  try {
    const { bytes } = await loadLineDocumentBytes(attachment.storageKey);
    return documentResponse({ bytes, mimeType: attachment.mimeType, fileName: attachment.fileName, download });
  } catch (error) {
    console.warn("line document read failed; attempting LINE content recovery", error);
    const recovered = await recoverLineDocumentFromLineContent(attachment);
    if (recovered) return documentResponse({ ...recovered, download });
    return NextResponse.json({ ok: false, error: "stored file not found" }, { status: 404 });
  }
}
