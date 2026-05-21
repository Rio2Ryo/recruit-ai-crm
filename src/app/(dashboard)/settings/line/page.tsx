import Link from "next/link";
import { Header } from "@/components/layout/header";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
  MessageCircle,
  Settings2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://recruit-ai-crm.vercel.app";

const directLineEnv = [
  "LINE_CHANNEL_ACCESS_TOKEN",
  "LINE_CHANNEL_SECRET",
  "NEXT_PUBLIC_APP_URL",
] as const;

const harnessEnv = [
  "LINE_HARNESS_API_URL",
  "LINE_HARNESS_API_KEY",
  "LINE_HARNESS_WEBHOOK_SECRET",
  "LINE_HARNESS_APPLIED_TAG_ID",
] as const;

const endpoints = [
  {
    label: "CRM本番URL / NEXT_PUBLIC_APP_URL",
    value: APP_URL,
    note: "Vercel env と LINE Harness 側の戻り先URLに使います。",
  },
  {
    label: "LINE Harness 応募Webhook",
    value: `${APP_URL}/api/integrations/line-harness/submission`,
    note: "Harnessのフォーム送信後処理 / Outgoing Webhook に設定します。",
  },
  {
    label: "LINE Harness 送信API",
    value: `${APP_URL}/api/integrations/line-harness/send`,
    note: "CRMからHarness経由でLINE送信するためのPOST APIです。",
  },
  {
    label: "直接LINE Webhook（フォールバック）",
    value: `${APP_URL}/api/line/webhook`,
    note: "Harnessを使わずLINE Developersへ直接Webhook登録する場合のみ使います。",
  },
];

function isConfigured(name: string) {
  return Boolean(process.env[name]);
}

function StatusPill({ configured }: { configured: boolean }) {
  return (
    <span
      className={
        configured
          ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200"
          : "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200"
      }
    >
      {configured ? (
        <CheckCircle2 className="size-3.5" />
      ) : (
        <TriangleAlert className="size-3.5" />
      )}
      {configured ? "設定済み" : "未設定"}
    </span>
  );
}

function ConfigValue({ value }: { value: string }) {
  return (
    <div className="mt-2 flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-slate-50 ring-1 ring-slate-800">
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-xs leading-relaxed">
        {value}
      </code>
      <Copy className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
    </div>
  );
}

function StepCard({
  title,
  description,
  steps,
}: {
  title: string;
  description: string;
  steps: string[];
}) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
      <ol className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm leading-6 text-gray-700">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700 ring-1 ring-indigo-100">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function LineSettingsPage() {
  const directConfigured = directLineEnv.every(isConfigured);
  const harnessConfigured = [
    "LINE_HARNESS_API_URL",
    "LINE_HARNESS_API_KEY",
    "LINE_HARNESS_WEBHOOK_SECRET",
  ].every(isConfigured);

  return (
    <div className="min-h-screen">
      <Header title="公式LINE設定" />

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-indigo-600 p-[1px] shadow-sm">
            <div className="rounded-3xl bg-white p-6 sm:p-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                    <MessageCircle className="size-3.5" />
                    推奨: LINE Harness 経由
                  </div>
                  <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                    公式LINEの設定場所を迷わないようにするページ
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">
                    公式LINEのトークンやWebhook設定は、基本的に LINE Developers / LINE Official Account Manager / LINE Harness 側で行います。
                    このCRMでは、本番URL・Webhook URL・必要なVercel env・接続状態だけを安全に確認できます。
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200 lg:w-80">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                    接続状態
                  </p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-gray-700">LINE Harness</span>
                      <StatusPill configured={harnessConfigured} />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-gray-700">直接LINE</span>
                      <StatusPill configured={directConfigured} />
                    </div>
                  </div>
                  <p className="mt-3 flex gap-2 text-xs leading-5 text-gray-500">
                    <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
                    秘密値は表示せず、envが存在するかだけをサーバー側で判定しています。
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            {endpoints.map((endpoint) => (
              <div key={endpoint.label} className="rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
                <p className="text-sm font-bold text-gray-900">{endpoint.label}</p>
                <ConfigValue value={endpoint.value} />
                <p className="mt-2 text-xs leading-5 text-gray-500">{endpoint.note}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-gray-950">Vercel env: LINE Harness</h2>
                  <p className="mt-1 text-sm text-gray-500">CRMがHarnessと連携するための設定です。</p>
                </div>
                <StatusPill configured={harnessConfigured} />
              </div>
              <div className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
                {harnessEnv.map((name) => (
                  <div key={name} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <code className="text-xs font-semibold text-gray-700">{name}</code>
                    <StatusPill configured={name === "LINE_HARNESS_APPLIED_TAG_ID" ? true : isConfigured(name)} />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-500">LINE_HARNESS_APPLIED_TAG_ID は任意です。</p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-gray-950">Vercel env: 直接LINE</h2>
                  <p className="mt-1 text-sm text-gray-500">Harnessを使わない場合のフォールバック設定です。</p>
                </div>
                <StatusPill configured={directConfigured} />
              </div>
              <div className="mt-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
                {directLineEnv.map((name) => (
                  <div key={name} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <code className="text-xs font-semibold text-gray-700">{name}</code>
                    <StatusPill configured={isConfigured(name)} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <StepCard
              title="1. LINE Developers / 公式アカウント側"
              description="公式LINEそのものの基本設定です。"
              steps={[
                "LINE Developers ConsoleでMessaging API channelを開く。",
                "Channel access token と Channel secret を確認する。",
                "Webhook URLはHarness経由ならHarnessのURL、直接運用ならCRMの /api/line/webhook を設定する。",
                "LINE Official Account Managerで応答設定・リッチメニュー・友だち追加導線を整える。",
              ]}
            />
            <StepCard
              title="2. LINE Harness / Cloudflare側"
              description="おすすめ運用。LINE周りの自動化はHarnessに寄せます。"
              steps={[
                "Harness側に公式LINEのtoken / secretを設定する。",
                "応募フォームまたはステップ配信を作成する。",
                "フォーム送信後のOutgoing WebhookにCRMの /api/integrations/line-harness/submission を設定する。",
                "必要に応じて採用ステータス連動タグをLINE_HARNESS_APPLIED_TAG_IDに対応させる。",
              ]}
            />
            <StepCard
              title="3. Vercel / CRM側"
              description="CRMがHarnessを呼び出すためのenvを設定します。"
              steps={[
                "Vercel Project Settings → Environment Variablesを開く。",
                "LINE_HARNESS_API_URL / LINE_HARNESS_API_KEY / LINE_HARNESS_WEBHOOK_SECRETをProductionに設定する。",
                "NEXT_PUBLIC_APP_URLを本番URLに設定する。",
                "設定後に再デプロイし、このページの接続状態が設定済みになるか確認する。",
              ]}
            />
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-950">
                  <Settings2 className="size-4 text-indigo-500" />
                  次に追加すると便利な機能
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
                  テスト送信UIは、誤送信や秘密情報露出を避けるため次フェーズで、送信先ID・テンプレート・監査ログを含めて追加するのが安全です。
                  まずはこのページで「どこに何を設定するか」を一箇所にまとめています。
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/pipeline"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  歩留まり管理へ
                  <ArrowRight className="size-4" />
                </Link>
                <a
                  href="https://developers.line.biz/console/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                >
                  LINE Developers
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
            <div className="mt-4 flex gap-2 rounded-xl bg-blue-50 p-3 text-sm leading-6 text-blue-800 ring-1 ring-blue-100">
              <Info className="mt-0.5 size-4 shrink-0" />
              <p>
                迷ったら、まずLINE Harness側に公式LINE設定を集約し、CRM側では応募Webhookと送信用APIだけを接続してください。
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
