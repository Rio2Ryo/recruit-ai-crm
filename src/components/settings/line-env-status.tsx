"use client";

import { useEffect, useState } from "react";
import { Activity, AlertCircle, CheckCircle2, Loader2, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

type CheckResult = {
  ok: boolean;
  status?: number;
  detail?: string;
  urls?: Record<string, string>;
  env?: Record<string, boolean>;
  note?: string;
  error?: string;
  message?: string;
};

export function LineEnvStatus() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState("");
  const [to, setTo] = useState("");
  const [text, setText] = useState("採用CRMからのLINEテスト送信です。");

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

  async function runCheck(action: "status" | "push-test") {
    setLoading(action);
    try {
      const response =
        action === "status"
          ? await fetch("/api/settings/line/test", { cache: "no-store" })
          : await fetch("/api/settings/line/test", {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
              body: JSON.stringify(action === "push-test" ? { action, to, text } : { action }),
            });
      setCheckResult((await response.json()) as CheckResult);
    } catch (error) {
      setCheckResult({ ok: false, error: error instanceof Error ? error.message : "check failed" });
    } finally {
      setLoading(null);
    }
  }

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
    <div className="space-y-4">
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

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-indigo-500" />
          <p className="text-sm font-bold text-gray-950">疎通確認・テスト送信</p>
        </div>
        <p className="mt-2 text-xs leading-5 text-gray-600">
          設定状態の確認は安全に実行できます。Webhook経路テストとLINE Push送信には管理キーが必要です。
        </p>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <div>
            <Label htmlFor="line-test-admin-key">管理キー</Label>
            <Input
              id="line-test-admin-key"
              className="mt-2"
              type="password"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              placeholder="LINE_SETTINGS_ADMIN_KEY"
              autoComplete="off"
            />
          </div>
          <div>
          <Label htmlFor="line-test-to">送信先LINE userId</Label>
            <Input
              id="line-test-to"
              className="mt-2"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
          </div>
          <Button type="button" variant="outline" onClick={() => runCheck("status")} disabled={Boolean(loading)}>
            {loading === "status" ? <Loader2 className="size-4 animate-spin" /> : <Activity className="size-4" />}
            状態確認
          </Button>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Label htmlFor="line-test-text">テスト文面</Label>
            <Input
              id="line-test-text"
              className="mt-2"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
          </div>
          <Button
            type="button"
            onClick={() => runCheck("push-test")}
            disabled={Boolean(loading) || !adminKey || !to || !text}
          >
            {loading === "push-test" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            テスト送信
          </Button>
        </div>

        {checkResult ? (
          <div className={`mt-3 rounded-lg border px-3 py-3 text-sm ${checkResult.ok ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`}>
            <div className="flex items-center gap-2 font-semibold">
              {checkResult.ok ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
              {checkResult.ok ? "OK" : "NG"}{checkResult.status ? ` / status ${checkResult.status}` : ""}
            </div>
            {checkResult.env ? (
              <div className="mt-2 grid gap-1 sm:grid-cols-3">
                {Object.entries(checkResult.env).map(([name, configured]) => (
                  <div key={name} className="rounded bg-white/70 px-2 py-1 text-xs">
                    <code>{name}</code>: {configured ? "configured" : "missing"}
                  </div>
                ))}
              </div>
            ) : null}
            {checkResult.urls ? (
              <div className="mt-2 space-y-1 text-xs">
                {Object.entries(checkResult.urls).map(([name, url]) => (
                  <p key={name}><span className="font-semibold">{name}</span>: {url}</p>
                ))}
              </div>
            ) : null}
            {checkResult.detail ? <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-xs">{checkResult.detail}</pre> : null}
            {checkResult.note ? <p className="mt-2 text-xs opacity-80">{checkResult.note}</p> : null}
            {checkResult.message ? <p className="mt-2 text-xs">{checkResult.message}</p> : null}
            {checkResult.error ? <p className="mt-2 text-xs">{checkResult.error}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
