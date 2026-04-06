import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoCompany } from "@/lib/demo-data";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">Recruit AI CRM</p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight">中小製造業向けの採用支援アプリ</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            企業ページ公開、応募受付、候補者管理、学校CRM、AIマッチング支援をひとつにまとめたデモUIです。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
              管理画面を見る
            </Link>
            <Link
              href={`/company/${demoCompany.slug}`}
              className={buttonVariants({ size: "lg", variant: "outline", className: "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white" })}
            >
              公開企業ページを見る
            </Link>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-white/10 bg-white/5 p-6 text-white">
            <h2 className="text-lg font-semibold">企業向け管理画面</h2>
            <p className="mt-2 text-sm text-slate-300">ダッシュボード、求人管理、候補者CRM、学校接点管理のUIを確認できます。</p>
          </Card>
          <Card className="border-white/10 bg-white/5 p-6 text-white">
            <h2 className="text-lg font-semibold">公開採用ページ</h2>
            <p className="mt-2 text-sm text-slate-300">高校生向けの企業紹介ページと求人詳細、応募フォームの導線を用意しています。</p>
          </Card>
          <Card className="border-white/10 bg-white/5 p-6 text-white">
            <h2 className="text-lg font-semibold">DB未接続デモ</h2>
            <p className="mt-2 text-sm text-slate-300">まずは見せられるUIを優先し、データ接続は次フェーズで行う前提です。</p>
          </Card>
        </div>
      </div>
    </main>
  );
}
