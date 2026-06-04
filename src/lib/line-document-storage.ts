import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_BUCKET = "line-documents";
const LOCAL_STORAGE_DIR = path.join("/tmp", "recruit-ai-crm", "line-documents");

export type StoredLineDocument = {
  storageKey: string;
  storageUrl: string;
  mimeType?: string;
  size: number;
};

export type LoadedLineDocument = {
  bytes: Buffer;
  source: "supabase" | "local";
};

export function getLineDocumentsBucket() {
  return process.env.LINE_DOCUMENTS_BUCKET ?? process.env.SUPABASE_LINE_DOCUMENTS_BUCKET ?? DEFAULT_BUCKET;
}

function isHttpUrl(value: string | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function deriveSupabaseUrlFromDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return undefined;

  try {
    const parsed = new URL(databaseUrl);
    const dbHostMatch = parsed.hostname.match(/^db\.([a-z0-9-]+)\.supabase\.co$/i);
    if (dbHostMatch?.[1]) return `https://${dbHostMatch[1]}.supabase.co`;

    // Supabase pooler URLs often keep the project ref in the username: postgres.<project-ref>
    const usernameMatch = decodeURIComponent(parsed.username).match(/postgres\.([a-z0-9-]+)/i);
    if (usernameMatch?.[1]) return `https://${usernameMatch[1]}.supabase.co`;
  } catch {
    return undefined;
  }

  return undefined;
}

function getSupabaseAdminClient() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const url = isHttpUrl(configuredUrl) ? configuredUrl : deriveSupabaseUrlFromDatabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function ensureLineDocumentsBucket(supabase: SupabaseClient, bucket: string) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (!listError && buckets?.some((item) => item.name === bucket)) return;

  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: false,
    fileSizeLimit: 20 * 1024 * 1024,
  });
  if (createError && !/already exists/i.test(createError.message)) {
    throw new Error(`Supabase Storage bucket setup failed (${bucket}): ${createError.message}`);
  }
}

export function safeLineDocumentName(name: string) {
  return name.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 120) || "line-document";
}

function extensionFromMimeType(mimeType?: string | null) {
  if (!mimeType) return "bin";
  const normalized = mimeType.split(";")[0]?.trim().toLowerCase();
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "application/pdf": "pdf",
    "text/plain": "txt",
    "audio/mpeg": "mp3",
    "audio/mp4": "m4a",
    "audio/webm": "webm",
    "video/mp4": "mp4",
    "application/octet-stream": "bin",
  };
  return map[normalized] ?? normalized?.split("/")[1]?.replace(/[^a-z0-9]/g, "") ?? "bin";
}

function buildObjectKey(input: { lineUserId: string; messageId: string; fileName?: string; mimeType?: string | null }) {
  const safeUserId = safeLineDocumentName(input.lineUserId);
  const fallbackName = `${input.messageId}.${extensionFromMimeType(input.mimeType)}`;
  const safeFileName = safeLineDocumentName(input.fileName ?? fallbackName);
  return `${safeUserId}/${input.messageId}-${safeFileName}`;
}

export async function saveLineDocumentBytes(input: {
  lineUserId: string;
  messageId: string;
  bytes: Buffer;
  fileName?: string;
  mimeType?: string | null;
}): Promise<StoredLineDocument> {
  const mimeType = input.mimeType ?? "application/octet-stream";
  const objectKey = buildObjectKey({ lineUserId: input.lineUserId, messageId: input.messageId, fileName: input.fileName, mimeType });
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const bucket = getLineDocumentsBucket();
    await ensureLineDocumentsBucket(supabase, bucket);
    const { error } = await supabase.storage.from(bucket).upload(objectKey, input.bytes, {
      contentType: mimeType,
      upsert: true,
    });
    if (error) {
      throw new Error(`Supabase Storage upload failed (${bucket}/${objectKey}): ${error.message}`);
    }
    return {
      storageKey: objectKey,
      storageUrl: `/api/line/documents/${encodeURIComponent(input.messageId)}`,
      mimeType,
      size: input.bytes.length,
    };
  }

  // Local fallback is only for local/dev environments. Production persistence requires Supabase service-role env.
  const storagePath = path.join(LOCAL_STORAGE_DIR, objectKey);
  await mkdir(path.dirname(storagePath), { recursive: true });
  await writeFile(storagePath, input.bytes);
  return {
    storageKey: storagePath,
    storageUrl: `/api/line/documents/${encodeURIComponent(input.messageId)}`,
    mimeType,
    size: input.bytes.length,
  };
}

export async function loadLineDocumentBytes(storageKey: string): Promise<LoadedLineDocument> {
  const supabase = getSupabaseAdminClient();

  if (supabase && !path.isAbsolute(storageKey)) {
    const bucket = getLineDocumentsBucket();
    const { data, error } = await supabase.storage.from(bucket).download(storageKey);
    if (error) {
      throw new Error(`Supabase Storage download failed (${bucket}/${storageKey}): ${error.message}`);
    }
    return { bytes: Buffer.from(await data.arrayBuffer()), source: "supabase" };
  }

  return { bytes: await readFile(storageKey), source: "local" };
}
