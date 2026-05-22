import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Database,
  ExternalLink,
  MessageCircle,
  MousePointerClick,
  Send,
  Settings2,
  ShieldCheck,
  Smartphone,
  Tags,
  Webhook,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { LineCopyField } from "@/components/settings/line-copy-field";
import { LineEnvStatus } from "@/components/settings/line-env-status";
import { LineHealthCheck } from "@/components/settings/line-health-check";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://recruit-ai-crm.vercel.app";

const routeSteps = [
  "公式LINE友だち追加",
  "リッチメニュー / 自動返信",
  "応募フォーム",
  "CRM候補者",
  "/pipeline選考管理",
  "必要に応じLINE連絡",
];

const roleCards = [
  {
    icon: Smartphone,
    title: "公式LINE",
    body: "応募者の入口です。友だち追加、リッチメニュー、自動返信、日程連絡の接点を担当します。",
  },
  {
    icon: Bot,
    title: "LINE Harness / Cloudflare",
    body: "推奨の運用レイヤーです。フォーム、タグ、ステップ配信、CRMへのWebhook送信を担当します。",
  },
  {
    icon: ClipboardCheck,
    title: "Recruit AI CRM",
    body: "候補者、応募、選考ステージ、歩留まり、社内確認の管理画面を担当します。",
  },
];

const setupChecklist = [
  {
    title: "公式LINEの入口を作る",
    owner: "LINE Official Account Manager",
    detail:
      "採用窓口用アカウントを用意し、友だち追加URL、応答設定、リッチメニューの枠を作ります。",
  },
  {
    title: "Messaging APIを有効化する",
    owner: "LINE Developers",
    detail:
      "チャネルシークレットとチャネルアクセストークンを発行します。直接運用時はCRMのWebhook URLも登録します。",
  },
  {
    title: "応募フォームをつなぐ",
    owner: "LINE Harness",
    detail:
      "推奨はHarnessの応募フォームです。フォーム送信後WebhookにCRMのsubmission URLを登録します。",
  },
  {
    title: "CRMで受けて選考に流す",
    owner: "Recruit AI CRM",
    detail:
      "応募データをCRM候補者として受け、/pipeline のLINE流入→応募→面接→内定→入社で管理します。",
  },
  {
    title: "必要な連絡だけLINEで返す",
    owner: "CRM + LINE Harness",
    detail:
      "面接日程や追加書類の連絡は、CRMからHarness送信APIを呼ぶ形に寄せます。",
  },
];

const harnessSteps = [
  "LINE Harness側に公式LINEチャネルを接続する",
  "採用応募フォームを作成し、リッチメニューまたは自動返信から開けるようにする",
  "フォーム送信後Webhookに CRM の LINE Harness submission webhook を設定する",
  "応募完了タグを使う場合はタグIDを LINE_HARNESS_APPLIED_TAG_ID に設定する",
  "テスト応募を1件流し、CRM側で受信レスポンスが返ることを確認する",
];

const directSteps = [
  "LINE DevelopersのMessaging API設定でWebhook利用をオンにする",
  "Webhook URLに Direct LINE webhook URL を設定する",
  "LINE_CHANNEL_ACCESS_TOKEN / LINE_CHANNEL_SECRET / NEXT_PUBLIC_APP_URL をVercelに設定する",
  "公式LINEで「応募」または「求人」と送信し、応募フォームURLが返信されることを確認する",
];

const vercelSteps = [
  "Vercel Project Settings → Environment Variables を開く",
  "Production環境に必要なenv名を追加する。secret valueはこの画面やログに出さない",
  "保存後にProductionを再デプロイしてruntime envへ反映する",
  "この画面のenv設定状態でconfiguredの数を確認する",
];

const envNames = [
  "LINE_CHANNEL_ACCESS_TOKEN",
  "LINE_CHANNEL_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "LINE_HARNESS_API_URL",
  "LINE_HARNESS_API_KEY",
  "LINE_HARNESS_WEBHOOK_SECRET",
  "LINE_HARNESS_APPLIED_TAG_ID optional",
];

const nextBuildItems = [
  {
    icon: Database,
    title: "DB永続化",
    body: "submission webhookで受けた応募をStudent / Applicationへupsertし、デモデータ依存を外します。",
  },
  {
    icon: Send,
    title: "LINE送信",
    body: "候補者カードからHarness friendIdを選んで、テンプレート送信と送信履歴を残します。",
  },
  {
    icon: Tags,
    title: "ステージ同期",
    body: "/pipelineのステージ変更をHarnessのタグ/metadataへ反映し、LINE側セグメント配信に使える状態にします。",
  },
];

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={step} className="flex gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700">
            {index + 1}
          </span>
          <span className="text-sm leading-6 text-gray-700">{step}</span>
        </li>
      ))}
    </ol>
  );
}

export default function LineSettingsPage() {
  const lineApplyUrl = `${APP_URL}/line/apply`;
  const directWebhookUrl = `${APP_URL}/api/line/webhook`;
  const harnessSubmissionUrl = `${APP_URL}/api/integrations/line-harness/submission`;
  const harnessSendUrl = `${APP_URL}/api/integrations/line-harness/send`;

  return (
    <div className="min-h-screen">
      <Header title="公式LINE応募導線" />

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="rounded-xl bg-white p-6 ring-1 ring-gray-200 shadow-sm sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                  <MessageCircle className="size-3.5" />
                  LINE応募導線セットアップ
                </div>
                <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                  公式LINEから応募、CRMの選考管理までを開通する
                </h1>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  採用担当が迷わず開通できるように、LINE側で作るもの、Harnessに任せるもの、
                  CRMで管理するものを分けています。推奨運用は
                  「公式LINE → LINE Harness → Recruit AI CRM」です。
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200 lg:w-80">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                  最短ゴール
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-gray-900">
                  友だち追加した応募者がフォームから応募し、採用担当が
                  /pipeline で選考を進められる状態。
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <ArrowRight className="size-4 text-indigo-500" />
              <h2 className="text-base font-bold text-gray-950">開通する導線</h2>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              {routeSteps.map((step, index) => (
                <div key={step} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-[11px] font-bold text-indigo-600">
                    STEP {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-5 text-gray-900">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {roleCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-4 text-sm font-bold text-gray-950">
                    {card.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{card.body}</p>
                </div>
              );
            })}
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
            <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Settings2 className="size-4 text-indigo-500" />
                <h2 className="text-base font-bold text-gray-950">
                  運用開始チェックリスト
                </h2>
              </div>
              <div className="mt-5 space-y-4">
                {setupChecklist.map((step, index) => (
                  <div key={step.title} className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-950">{step.title}</p>
                      <p className="mt-1 text-xs font-semibold text-indigo-600">
                        担当: {step.owner}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-gray-600">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  <h2 className="text-base font-bold text-gray-950">env設定状態</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  secret valueは画面に出さず、必要なenvが設定済みかだけを表示します。
                </p>
                <div className="mt-4">
                  <LineEnvStatus />
                </div>
              </div>

              <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
                <h2 className="text-base font-bold text-gray-950">Vercel env名</h2>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {envNames.map((name) => (
                    <code
                      key={name}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800"
                    >
                      {name}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <LineHealthCheck />

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Bot className="size-4 text-emerald-500" />
                <h2 className="text-base font-bold text-gray-950">
                  推奨: LINE Harness側で開通
                </h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                公式LINEの自動化、応募フォーム、タグ管理はHarnessに寄せます。
              </p>
              <div className="mt-4">
                <StepList steps={harnessSteps} />
              </div>
            </div>

            <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Webhook className="size-4 text-indigo-500" />
                <h2 className="text-base font-bold text-gray-950">
                  フォールバック: 直接Messaging API
                </h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Harnessをまだ使わない場合は、LINE DevelopersからCRMへ直接Webhookを向けます。
              </p>
              <div className="mt-4">
                <StepList steps={directSteps} />
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Webhook className="size-4 text-indigo-500" />
              <h2 className="text-base font-bold text-gray-950">
                コピーして設定するURL
              </h2>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <LineCopyField
                label="CRM production URL / NEXT_PUBLIC_APP_URL"
                value={APP_URL}
                helper="Vercel envのNEXT_PUBLIC_APP_URLと、外部ツールからCRMを呼ぶ基準URLに使います。"
              />
              <LineCopyField
                label="簡易応募フォームURL（リッチメニュー / 自動返信）"
                value={lineApplyUrl}
                helper="Harness未接続の最短テストでは、このURLをLINEのメニューや応答メッセージに入れます。"
              />
              <LineCopyField
                label="Direct LINE webhook URL"
                value={directWebhookUrl}
                helper="LINE DevelopersのMessaging API Webhook URLに設定します。"
              />
              <LineCopyField
                label="LINE Harness submission webhook"
                value={harnessSubmissionUrl}
                helper="Harnessのフォーム送信後Webhook / Outgoing Webhookに設定します。"
              />
              <LineCopyField
                label="LINE Harness send API"
                value={harnessSendUrl}
                helper="CRMからHarness経由でLINE連絡するためのサーバーAPIです。"
              />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200 shadow-sm lg:col-span-2">
              <div className="flex items-center gap-2">
                <MousePointerClick className="size-4 text-emerald-500" />
                <h2 className="text-base font-bold text-gray-950">最短テスト手順</h2>
              </div>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-gray-700">
                <li>1. LINE DevelopersでMessaging API channelを作り、token/secretを発行する。</li>
                <li>2. Vercelに必要envを設定し、Productionを再デプロイする。</li>
                <li>3. 直接テストならWebhook URLに <code className="rounded bg-gray-100 px-1 py-0.5">/api/line/webhook</code> を登録する。</li>
                <li>4. 公式LINEを友だち追加し、「応募」または「求人」と送信して応募フォームURLが返ることを確認する。</li>
                <li>5. 本運用ではHarnessの応募フォーム送信後Webhookを <code className="rounded bg-gray-100 px-1 py-0.5">/api/integrations/line-harness/submission</code> に向ける。</li>
                <li>6. CRMでは <Link href="/pipeline" className="font-semibold text-indigo-600 hover:underline">/pipeline</Link> でLINE流入から選考を進める。</li>
              </ol>
            </div>

            <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
              <h2 className="text-base font-bold text-gray-950">
                ヘルスチェック
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                GETできる安全なendpointだけを開きます。secret値は返しません。
              </p>
              <div className="mt-4 space-y-2">
                <a
                  href={directWebhookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Direct webhook
                  <ExternalLink className="size-4" />
                </a>
                <a
                  href={harnessSubmissionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Harness submission
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-white p-5 ring-1 ring-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-indigo-500" />
              <h2 className="text-base font-bold text-gray-950">
                Vercel設定手順
              </h2>
            </div>
            <div className="mt-4">
              <StepList steps={vercelSteps} />
            </div>
          </section>

          <section className="rounded-xl bg-slate-950 p-5 text-white shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-bold">次に作るべきCRM機能</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  ここから先は、LINE応募導線を本番運用に耐える状態へ進める実装です。
                </p>
              </div>
              <Link
                href="/pipeline"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                歩留まり管理へ
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {nextBuildItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-lg bg-white/8 p-4 ring-1 ring-white/10">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-emerald-300" />
                      <h3 className="text-sm font-bold">{item.title}</h3>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-300">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
