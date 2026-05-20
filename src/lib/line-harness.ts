const DEFAULT_TIMEOUT_MS = 30_000;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  timeoutMs?: number;
};

export type LineHarnessConfig = {
  apiUrl: string;
  apiKey: string;
  timeoutMs?: number;
};

export type LineHarnessFriend = {
  id: string;
  lineUserId?: string;
  displayName?: string;
  pictureUrl?: string;
  metadata?: Record<string, unknown>;
  tags?: Array<{ id: string; name: string; color?: string }>;
};

export type LineHarnessFormSubmission = {
  id?: string;
  formId?: string;
  friendId?: string;
  lineUserId?: string;
  data?: Record<string, unknown>;
  submittedAt?: string;
};

export function getLineHarnessConfig(): LineHarnessConfig | null {
  const apiUrl = process.env.LINE_HARNESS_API_URL;
  const apiKey = process.env.LINE_HARNESS_API_KEY;

  if (!apiUrl || !apiKey) return null;

  return {
    apiUrl: apiUrl.replace(/\/$/, ""),
    apiKey,
    timeoutMs: Number(process.env.LINE_HARNESS_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS),
  };
}

export class LineHarnessClient {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(config: LineHarnessConfig) {
    this.apiUrl = config.apiUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? this.timeoutMs);

    try {
      const response = await fetch(`${this.apiUrl}${path}`, {
        method: options.method ?? "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      const text = await response.text();
      const json = text ? JSON.parse(text) : null;

      if (!response.ok || json?.success === false) {
        throw new Error(`LINE Harness API error: ${response.status} ${json?.error ?? text}`);
      }

      return (json?.data ?? json) as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  listFriends(params: { limit?: number; offset?: number; tagId?: string } = {}) {
    const search = new URLSearchParams();
    if (params.limit) search.set("limit", String(params.limit));
    if (params.offset) search.set("offset", String(params.offset));
    if (params.tagId) search.set("tagId", params.tagId);

    return this.request<{ items: LineHarnessFriend[]; total: number; hasNextPage: boolean }>(
      `/api/friends${search.size ? `?${search.toString()}` : ""}`
    );
  }

  sendMessage(friendId: string, content: string, messageType: "text" | "image" | "flex" = "text") {
    return this.request<{ messageId?: string }>(`/api/friends/${friendId}/messages`, {
      method: "POST",
      body: { content, messageType },
    });
  }

  setMetadata(friendId: string, metadata: Record<string, unknown>) {
    return this.request<LineHarnessFriend>(`/api/friends/${friendId}/metadata`, {
      method: "PUT",
      body: metadata,
    });
  }

  addTag(friendId: string, tagId: string) {
    return this.request(`/api/friends/${friendId}/tags`, {
      method: "POST",
      body: { tagId },
    });
  }
}

export function getLineHarnessClient() {
  const config = getLineHarnessConfig();
  return config ? new LineHarnessClient(config) : null;
}

export function getStringField(data: Record<string, unknown> | undefined, keys: string[]) {
  if (!data) return undefined;

  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return undefined;
}
