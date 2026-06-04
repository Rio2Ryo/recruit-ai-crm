"use client";

import { useState } from "react";
import { Activity, CheckCircle2, Loader2, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CheckResult = {
  ok: boolean;
  status?: number;
  detail?: string;
  urls?: Record<string, string>;
  env?: Record<string, boolean>;
  note?: string;
  error?: string;
};

export function LineHealthCheck() {
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState("");
  const [to, setTo] = useState("");
  const [text, setText] = useState("採用CRMからのLINEテスト送信です。");

  async function run(action: "status" | "push-test") {
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
      const json = (await response.json()) as CheckResult;
      setResult(json);
    } catch (error) {
      setResult({ ok: false, error: error instanceof Error ? error.message : "check failed" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
      <div className="flex items-center gap-2">
        <Activity className="size-4 text-indigo-500" />
        <h2 className="text-base font-bold text-gray-950">疎通確認・テスト送信</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        設定状態と、LINE公式アカウントへの直接送信を確認できます。
      </p>

      <div className="mt-4 max-w-md">
        <Label htmlFor="line-test-admin-key">管理キー</Label>
        <Input
          id="line-test-admin-key"
          className="mt-2"
          type="password"
          value={adminKey}
          onChange={(event) => setAdminKey(event.target.value)}
          placeholder="LINE_SETTINGS_ADMIN_KEY または LINE_CLI_ADMIN_KEY"
          autoComplete="off"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => run("status")} disabled={Boolean(loading)}>
          {loading === "status" ? <Loader2 className="size-4 animate-spin" /> : <Activity className="size-4" />}
          設定状態を確認
        </Button>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <div>
          <Label htmlFor="line-test-to">送信先LINE userId</Label>
          <Input id="line-test-to" className="mt-2" value={to} onChange={(event) => setTo(event.target.value)} placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
        </div>
        <div>
          <Label htmlFor="line-test-text">テスト文面</Label>
          <Input id="line-test-text" className="mt-2" value={text} onChange={(event) => setText(event.target.value)} />
        </div>
        <Button type="button" onClick={() => run("push-test")} disabled={Boolean(loading) || !adminKey || !to || !text}>
          {loading === "push-test" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          テスト送信
        </Button>
      </div>

      {result ? (
        <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${result.ok ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`}>
          <div className="flex items-center gap-2 font-semibold">
            {result.ok ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
            {result.ok ? "OK" : "NG"}{result.status ? ` / status ${result.status}` : ""}
          </div>
          {result.env ? (
            <div className="mt-2 grid gap-1 sm:grid-cols-3">
              {Object.entries(result.env).map(([name, configured]) => (
                <div key={name} className="rounded bg-white/70 px-2 py-1 text-xs">
                  <code>{name}</code>: {configured ? "configured" : "missing"}
                </div>
              ))}
            </div>
          ) : null}
          {result.urls ? (
            <div className="mt-2 space-y-1 text-xs">
              {Object.entries(result.urls).map(([name, url]) => (
                <p key={name}><span className="font-semibold">{name}</span>: {url}</p>
              ))}
            </div>
          ) : null}
          {result.detail ? <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-xs">{result.detail}</pre> : null}
          {result.note ? <p className="mt-2 text-xs opacity-80">{result.note}</p> : null}
          {result.error ? <p className="mt-2 text-xs">{result.error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
