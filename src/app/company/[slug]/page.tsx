import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function PublicCompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  await params;

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-medium text-indigo-200">高卒採用向け企業ページ</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">企業情報は未登録です</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
            登録済みの企業情報だけを表示します。ダミー企業情報は表示していません。
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/line/apply" className={buttonVariants({ size: "lg" })}>応募フォームへ</Link>
            <Link href="/dashboard" className={buttonVariants({ size: "lg", variant: "outline", className: "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white" })}>管理画面へ</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <Card className="border-dashed p-10 text-center text-sm text-gray-500">
          公開企業ページに表示できる求人・会社情報はまだ登録されていません。
        </Card>
      </section>
    </main>
  );
}
