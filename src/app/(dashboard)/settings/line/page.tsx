import { ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { LineAnalyticsPanel } from "@/components/line/line-analytics-panel";
import { LineEnvStatus } from "@/components/settings/line-env-status";
import { LineHealthCheck } from "@/components/settings/line-health-check";
import { LineRecruitingAdminConsole } from "@/components/settings/line-recruiting-admin-console";

const flow = [
  "友だち追加",
  "応募フォーム",
  "CRMへ自動登録",
  "選考ステージ管理",
  "LINEで連絡",
];

export default function LineSettingsPage() {
  return (
    <div className="min-h-screen">
      <Header title="LINE採用管理" />

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200 ring-1 ring-emerald-300/20">
                  <MessageCircle className="size-3.5" />
                  LINEから採用するための管理画面
                </div>
                <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                  友だち追加から応募・選考連絡まで、必要なものだけを管理
                </h1>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  公式LINE直連携を前提に、採用担当が触るべき項目だけに絞りました。
                  公式LINEの入口、応募フォーム、返信テンプレート、選考タグ、テスト送信をこの画面で管理します。
                </p>
              </div>
              <Link
                href="/pipeline"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                選考管理へ
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-2 md:grid-cols-5">
              {flow.map((item, index) => (
                <div key={item} className="rounded-xl bg-white/8 p-3 ring-1 ring-white/10">
                  <p className="text-[11px] font-bold text-emerald-200">STEP {index + 1}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <LineRecruitingAdminConsole />
          <LineAnalyticsPanel />

          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-500" />
                <h2 className="text-base font-bold text-gray-950">必要envの状態</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                secret値は表示せず、LINE採用に必要な環境変数が入っているかだけを確認します。
              </p>
              <div className="mt-4">
                <LineEnvStatus />
              </div>
            </div>

            <LineHealthCheck />
          </section>
        </div>
      </main>
    </div>
  );
}
