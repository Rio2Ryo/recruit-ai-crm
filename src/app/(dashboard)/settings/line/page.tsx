import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  MessageCircle,
  MousePointerClick,
  Send,
  Settings2,
  ShieldCheck,
  Smartphone,
  Webhook,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { LineCopyField } from "@/components/settings/line-copy-field";
import { LineEnvStatus } from "@/components/settings/line-env-status";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://recruit-ai-crm.vercel.app";

const setupSteps = [
  {
    title: "LINE公式アカウントを作る",
    owner: "LINE Official Account Manager",
    detail: "採用窓口用アカウントを作成し、応答設定をWebhook利用前提にします。",
  },
  {
    title: "Messaging API channelを有効化",
    owner: "LINE Developers",
    detail: "Channel secret / Channel access token を発行します。CRMに直接つなぐ場合はWebhook URLも登録します。",
  },
  {
    title: "応募フォームへの入口を作る",
    owner: "LINE Harness または CRM",
    detail: "推奨はLINE Harnessのフォーム/リッチメニュー。簡易版はCRMの /line/apply を応募URLとして使います。",
  },
  {
    title: "応募送信をCRMに流す",
    owner: "LINE Harness → Recruit AI CRM",
    detail: "Harnessのフォーム送信後WebhookにCRMのsubmission URLを設定し、応募者をCRMへ送ります。",
  },
  {
    title: "CRMで選考管理する",
    owner: "Recruit AI CRM",
    detail: "応募後は /pipeline でLINE流入→応募→面接→内定→入社まで管理します。",
  },
];

const roleCards = [
  {
    icon: Smartphone,
    title: "公式LINE",
    body: "応募者との接点。友だち追加、リッチメニュー、自動返信、日程連絡を担当します。",
  },
  {
    icon: Bot,
    title: "LINE Harness",
    body: "推奨の自動化レイヤー。フォーム、タグ、ステップ配信、Webhookを担当します。",
  },
  {
    icon: ClipboardCheck,
    title: "Recruit AI CRM",
    body: "候補者DB、応募、選考ステージ、歩留まり、社内管理画面を担当します。",
  },
];

export default function LineSettingsPage() {
  const lineApplyUrl = `${APP_URL}/line/apply`;
  const directWebhookUrl = `${APP_URL}/api/line/webhook`;
  const harnessSubmissionUrl = `${APP_URL}/api/integrations/line-harness/submission`;
  const harnessSendUrl = `${APP_URL}/api/integrations/line-harness/send`;

  return (
    <div className="min-h-screen">
      <Header title="公式LINE設定" />

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="rounded-3xl bg-gradient-to-br from-[#06c755] via-emerald-500 to-indigo-600 p-[1px] shadow-sm">
            <div className="rounded-3xl bg-white p-6 sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                    <MessageCircle className="size-3.5" />
                    LINE応募導線セットアップ
                  </div>
                  <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                    ここを見れば、LINEで何をどう設定するか分かります
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    目的は、応募者が公式LINEから求人確認・応募・日程連絡まで進み、採用担当はCRMの歩留まり管理で選考を進められる状態にすることです。
                    推奨は「公式LINE → LINE Harness → Recruit AI CRM」の分担です。
                  </p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200 lg:w-80">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">今やること</p>
                  <ol className="mt-3 space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-500" />LINE Developersでtoken/secret発行</li>
                    <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-500" />Vercel envへ設定</li>
                    <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-500" />Harnessに応募Webhook登録</li>
                    <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 text-emerald-500" />友だち追加→応募テスト</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {roleCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-4 text-sm font-bold text-gray-950">{card.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{card.body}</p>
                </div>
              );
            })}
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Settings2 className="size-4 text-indigo-500" />
                <h2 className="text-base font-bold text-gray-950">運用開始チェックリスト</h2>
              </div>
              <div className="mt-5 space-y-4">
                {setupSteps.map((step, index) => (
                  <div key={step.title} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-950">{step.title}</p>
                      <p className="mt-1 text-xs font-semibold text-indigo-600">担当: {step.owner}</p>
                      <p className="mt-1 text-sm leading-6 text-gray-600">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-500" />
                <h2 className="text-base font-bold text-gray-950">env設定状態</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                秘密値は画面に出しません。設定済みかどうかだけを確認します。
              </p>
              <div className="mt-4">
                <LineEnvStatus />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Webhook className="size-4 text-indigo-500" />
              <h2 className="text-base font-bold text-gray-950">コピーして設定するURL</h2>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <LineCopyField
                label="簡易応募フォームURL（リッチメニュー / 自動返信に設定）"
                value={lineApplyUrl}
                helper="Harnessを使わない最短テストは、このURLをLINEのメニューや応答メッセージに入れます。"
              />
              <LineCopyField
                label="直接LINE Webhook URL（Messaging API Webhook URL）"
                value={directWebhookUrl}
                helper="LINE Developersに直接Webhook登録する場合に使います。Harness経由なら通常は使いません。"
              />
              <LineCopyField
                label="LINE Harness 応募Webhook（フォーム送信後処理）"
                value={harnessSubmissionUrl}
                helper="Harnessのフォーム送信後Webhook / Outgoing Webhookに設定します。"
              />
              <LineCopyField
                label="LINE Harness 送信API（CRM→Harness→LINE）"
                value={harnessSendUrl}
                helper="候補者へのLINE送信をCRM側から行う場合のサーバーAPIです。"
              />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <MousePointerClick className="size-4 text-emerald-500" />
                <h2 className="text-base font-bold text-gray-950">最短テスト手順</h2>
              </div>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-gray-700">
                <li>1. LINE DevelopersでWebhook URLに <code className="rounded bg-gray-100 px-1 py-0.5">/api/line/webhook</code> を登録。</li>
                <li>2. Vercel envに <code className="rounded bg-gray-100 px-1 py-0.5">LINE_CHANNEL_ACCESS_TOKEN</code> と <code className="rounded bg-gray-100 px-1 py-0.5">LINE_CHANNEL_SECRET</code> を設定。</li>
                <li>3. 公式LINEを友だち追加し、「応募」または「求人」と送信。</li>
                <li>4. 返信された応募フォームからテスト応募。</li>
                <li>5. 本運用ではHarnessのフォームWebhookを <code className="rounded bg-gray-100 px-1 py-0.5">submission</code> URLへ切り替える。</li>
              </ol>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Send className="size-4 text-indigo-500" />
                <h2 className="text-base font-bold text-gray-950">この画面の次に作るべき機能</h2>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-700">
                <li>・応募WebhookをDBの Student / Application に永続化する</li>
                <li>・/pipeline をデモデータではなくDBから表示する</li>
                <li>・候補者カードからLINEメッセージ送信できるようにする</li>
                <li>・ステージ変更時にHarnessのタグ/metadataを更新する</li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
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
          </section>
        </div>
      </main>
    </div>
  );
}
