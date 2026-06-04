import { NextRequest, NextResponse } from "next/server";
import { addLineAttachment } from "@/lib/line-applicant-store";
import { saveLineDocumentBytes, safeLineDocumentName } from "@/lib/line-document-storage";

export async function POST(request: NextRequest) {
  const input = (await request.json().catch(() => ({}))) as {
    lineUserId?: string;
    friendId?: string;
    applicantName?: string;
    fileName?: string;
    mimeType?: string;
    contentBase64?: string;
  };

  if (!input.lineUserId || !input.contentBase64) {
    return NextResponse.json({ ok: false, error: "lineUserId and contentBase64 are required" }, { status: 400 });
  }

  const bytes = Buffer.from(input.contentBase64, "base64");
  const documentId = `line-doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const fileName = safeLineDocumentName(input.fileName ?? "document.bin");
  const stored = await saveLineDocumentBytes({
    lineUserId: input.lineUserId,
    messageId: documentId,
    fileName,
    mimeType: input.mimeType ?? "application/octet-stream",
    bytes,
  });

  const result = await addLineAttachment(input.lineUserId, {
    messageId: documentId,
    type: input.mimeType?.startsWith("image/") ? "image" : "file",
    fileName: input.fileName ?? fileName,
    storageKey: stored.storageKey,
    storageUrl: stored.storageUrl,
    mimeType: stored.mimeType,
    size: stored.size,
  });

  return NextResponse.json({ ok: true, applicant: result.applicant, attachment: result.attachment });
}
