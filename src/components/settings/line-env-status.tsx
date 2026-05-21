"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

type EnvItem = {
  name: string;
  configured: boolean;
  optional?: boolean;
};

type StatusResponse = {
  ok: boolean;
  appUrl: {
    value: string;
    configured: boolean;
  };
  env: EnvItem[];
};

export function LineEnvStatus() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/settings/line/status", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`status ${response.status}`);
        return (await response.json()) as StatusResponse;
      })
      .then((data) => {
        if (mounted) setStatus(data);
      })
      .catch(() => {
        if (mounted) setError("設定状態を取得できませんでした。");
      });

    return () => {
      mounted = false;
    };
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
    </div>
  );
}
