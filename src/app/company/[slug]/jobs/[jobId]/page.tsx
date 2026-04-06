import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoCompany, demoJobs } from "@/lib/demo-data";

export default async function PublicJobDetailPage({ params }: { params: Promise<{ slug: string; jobId: string }> }) {
  const { slug, jobId } = await params;
  const job = demoJobs.find((item) => item.id === jobId);

  if (slug !== demoCompany.slug || !job) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Link href={`/company/${slug}`} className="text-sm font-medium text-indigo-600">← 企業ページに戻る</Link>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-8">
            <p className="text-sm font-medium text-indigo-600">募集職種</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">{job.title}</h1>
            <p className="mt-3 text-gray-600">ものづくりの現場で、先輩社員のサポートを受けながら着実に技術を身につけられるポジションです。</p>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card className="p-4 bg-gray-50">
                <p className="text-sm text-gray-500">勤務地</p>
                <p className="mt-1 font-semibold text-gray-900">{job.location}</p>
              </Card>
              <Card className="p-4 bg-gray-50">
                <p className="text-sm text-gray-500">募集状況</p>
                <p className="mt-1 font-semibold text-gray-900">{job.status}</p>
              </Card>
            </div>

            <div className="mt-8 space-y-6 text-sm leading-7 text-gray-600">
              <section>
                <h2 className="text-base font-semibold text-gray-900">仕事内容</h2>
                <p className="mt-2">製造ラインのオペレーション、品質確認、機械の基本点検などを担当します。</p>
              </section>
              <section>
                <h2 className="text-base font-semibold text-gray-900">向いている人</h2>
                <ul className="mt-2 list-disc pl-5">
                  <li>コツコツ正確に取り組める人</li>
                  <li>チームで協力して働きたい人</li>
                  <li>機械やものづくりに興味がある人</li>
                </ul>
              </section>
            </div>
          </Card>

          <Card className="p-6 h-fit sticky top-6">
            <p className="text-sm text-gray-500">この求人への応募</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">まずはエントリー</p>
            <p className="mt-3 text-sm text-gray-500">簡単な入力だけで応募できます。あとから学校情報や履歴書の提出も可能です。</p>
            <Link
              href={`/company/${slug}/apply?jobId=${job.id}`}
              className={buttonVariants({ size: "lg", className: "mt-6 w-full" })}
            >
              応募フォームへ進む
            </Link>
          </Card>
        </div>
      </div>
    </main>
  );
}
