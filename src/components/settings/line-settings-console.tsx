"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Save, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const editableEnv = [
  {
    name: "LINE_CHANNEL_ACCESS_TOKEN",
    label: "LINEチャネルアクセストークン",
    placeholder: "LINE Developersで発行した長期チャネルアクセストークン",
    secret: true,
  },
  {
    name: "LINE_CHANNEL_SECRET",
    label: "LINEチャネルシークレット",
    placeholder: "LINE DevelopersのBasic settingsにあるChannel secret",
    secret: true,
  },
  {
    name: "NEXT_PUBLIC_APP_URL",
    label: "CRM公開URL",
    placeholder: "https://recruit-ai-crm.vercel.app",
    secret: false,
  },
  {
    name: "LINE_HARNESS_API_URL",
    label: "LINE Harness API URL",
    placeholder: "https://...",
    secret: false,
  },
  {
    name: "LINE_HARNESS_API_KEY",
    label: "LINE Harness API Key",
    placeholder: "Harness側のAPIキー",
    secret: true,
  },
  {
    name: "LINE_HARNESS_WEBHOOK_SECRET",
    label: "Harness Webhook Secret",
    placeholder: "Harness→CRM webhook認証用の共有secret",
    secret: true,
  },
  {
    name: "LINE_HARNESS_APPLIED_TAG_ID",
    label: "応募完了タグID（任意）",
    placeholder: "応募完了タグを付ける場合のみ",
    secret: false,
  },
] as const;

type Capability = {
  ok: boolean;
  writable: boolean;
  tokenConfigured: boolean;
  projectIdConfigured: boolean;
  teamIdConfigured: boolean;
  requiredServerEnv: string[];
};

type SaveState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function LineSettingsConsole() {
  const [capability, setCapability] = useState<Capability | null>(null);
  const [adminKey, setAdminKey] = useState("");
  const [values, setValues] = useState<Record<string, string>>({
    NEXT_PUBLIC_APP_URL: "https://recruit-ai-crm.vercel.app",
  });
  const [visibleSecrets, setVisibleSecrets] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({ type: "idle" });

  useEffect(() => {
    fetch("/api/settings/line/env", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`status ${response.status}`);
        return (await response.json()) as Capability;
      })
      .then(setCapability)
      .catch(() => setCapability(null));
  }, []);

  function update(name: string, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function save() {
    setSaveState({ type: "loading" });

    const env = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value.trim().length > 0)
    );

    try {
      const response = await fetch("/api/settings/line/env", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({ env }),
      });
      const json = await response.json();

      if (!response.ok || !json.ok) {
        throw new Error(json.message ?? json.error ?? "保存に失敗しました。");
      }

      setValues({ NEXT_PUBLIC_APP_URL: values.NEXT_PUBLIC_APP_URL ?? "" });
      setSaveState({
        type: "success",
        message: `${json.results.length}件のenvを保存しました。Vercel Productionの再デプロイで反映されます。`,
      });
    } catch (error) {
      setSaveState({
        type: "error",
        message: error instanceof Error ? error.message : "保存に失敗しました。",
      });
    }
  }

  const isWritable = Boolean(capability?.writable);

  return (
    <div className="space-y-5 rounded-xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-indigo-500" />
            <h2 className="text-base font-bold text-gray-950">管理画面からLINE envを設定</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            秘密値は保存時だけ送信し、画面には保持しません。保存後はProduction再デプロイが必要です。
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 ring-1 ring-gray-200">
          {isWritable ? <CheckCircle2 className="size-4 text-emerald-500" /> : <AlertCircle className="size-4 text-amber-500" />}
          {isWritable ? "保存API 有効" : "保存API 未設定"}
        </div>
      </div>

      {!isWritable ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          画面保存を使うには、Vercel envに <code>LINE_SETTINGS_ADMIN_KEY</code>（または <code>LINE_CLI_ADMIN_KEY</code>）と
          <code> VERCEL_API_TOKEN</code> を設定してください。未設定でも、下のフォーム内容をVercel CLIで手動投入できます。
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="line-admin-key">管理キー</Label>
          <Input
            id="line-admin-key"
            className="mt-2"
            type="password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            placeholder="LINE_SETTINGS_ADMIN_KEY"
            autoComplete="off"
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setVisibleSecrets((value) => !value)}
            className="w-full sm:w-auto"
          >
            {visibleSecrets ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {visibleSecrets ? "秘密値を隠す" : "秘密値を表示"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {editableEnv.map((item) => (
          <div key={item.name}>
            <Label htmlFor={item.name}>{item.label}</Label>
            <Input
              id={item.name}
              className="mt-2"
              type={item.secret && !visibleSecrets ? "password" : "text"}
              value={values[item.name] ?? ""}
              onChange={(event) => update(item.name, event.target.value)}
              placeholder={item.placeholder}
              autoComplete="off"
            />
            <code className="mt-1 block text-[11px] font-semibold text-gray-400">{item.name}</code>
          </div>
        ))}
      </div>

      {saveState.type !== "idle" ? (
        <div
          className={
            saveState.type === "success"
              ? "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              : saveState.type === "error"
                ? "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                : "rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600"
          }
        >
          {saveState.type === "loading" ? "保存中..." : saveState.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-gray-500">
          注意: Vercel env更新は即時runtime反映されません。保存後にProductionを再デプロイしてください。
        </p>
        <Button type="button" onClick={save} disabled={saveState.type === "loading" || !isWritable}>
          {saveState.type === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Vercel envへ保存
        </Button>
      </div>
    </div>
  );
}
