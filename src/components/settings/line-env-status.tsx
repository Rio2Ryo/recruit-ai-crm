"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Database, Loader2, XCircle } from "lucide-react";

type EnvItem = {
  name: string;
  configured: boolean;
  optional?: boolean;
};

type DbHealth = {
  configured: boolean;
  ok: boolean;
  error?: string;
  counts?: {
    applicants: number;
    actions: number;
    messages: number;
    documents: number;
    schedules: number;
  };
};

type StatusResponse = {
  ok: boolean;
  appUrl: { value: string; configured: boolean };
  db: DbHealth;
  env: EnvItem[];
};

export function LineEnvStatus() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/settings/line/status", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`status ${r.status}`);
        return (await r.json()) as StatusResponse;
      })
      .then((data) => { if (mounted) setStatus(data); })
      .catch(() => { if (mounted) setError("設定状態を取得できませんでした。"); });
    return () => { mounted = false; };
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
        {error}
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-500">
        <Loader2 className="size-4 animate-spin" />
        設定状態を確認中
      </div>
    );
  }

  const required = status.env.filter((item) => !item.optional);
  const configuredCount = required.filter((item) => item.configured).length;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
        <p className="text-xs font-semibold text-gray-500">必須env設定</p>
        <p className="mt-1 text-sm font-semibold text-gray-900">
          {configuredCount} / {required.length} configured
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {status.env.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"
          >
            <div className="min-w-0">
              <code className="block truncate text-xs font-semibold text-gray-800">
                {item.name}
              </code>
              {item.optional ? (
                <span className="text-[11px] text-gray-400">optional</span>
              ) : null}
            </div>
            {item.configured ? (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="size-4 shrink-0 text-amber-500" />
            )}
          </div>
        ))}
      </div>

      {status.db && (
        <div className={`rounded-lg border px-3 py-3 ${status.db.ok ? "border-emerald-200 bg-emerald-50" : status.db.configured ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
          <div className="flex items-center gap-2">
            <Database className="size-4 shrink-0 text-gray-500" />
            <p className="text-xs font-semibold text-gray-700">DB接続</p>
            {status.db.ok ? (
              <CheckCircle2 className="size-4 text-emerald-500" />
            ) : status.db.configured ? (
              <XCircle className="size-4 text-red-500" />
            ) : (
              <AlertCircle className="size-4 text-amber-500" />
            )}
          </div>
          {status.db.ok && status.db.counts ? (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-emerald-800">
              <span>応募者: {status.db.counts.applicants}</span>
              <span>アクション: {status.db.counts.actions}</span>
              <span>メッセージ: {status.db.counts.messages}</span>
              <span>書類: {status.db.counts.documents}</span>
            </div>
          ) : status.db.error ? (
            <p className="mt-1 text-xs text-red-700">{status.db.error}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">DATABASE_URL 未設定</p>
          )}
        </div>
      )}
    </div>
  );
}
