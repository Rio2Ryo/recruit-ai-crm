import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoCompany, demoJobs } from "@/lib/demo-data";

export default async function PublicCompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug !== demoCompany.slug) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-sm font-medium text-indigo-200">高卒採用向け企業ページ</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">{demoCompany.name}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">{demoCompany.description}</p>
          <div className="mt-8 flex gap-3">
            <Link href={`/company/${demoCompany.slug}/jobs/${demoJobs[0].id}`} className={buttonVariants({ size: "lg" })}>
              求人を見る
            </Link>
            <Link
              href={`/company/${demoCompany.slug}/apply`}
              className={buttonVariants({ size: "lg", variant: "outline", className: "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white" })}
            >
              応募する
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="p-6">
            <p className="text-sm text-gray-500">業種</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">{demoCompany.industry}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-500">勤務地</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">{demoCompany.prefecture}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-500">従業員数</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">{demoCompany.employeeCount}名</p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">働く魅力</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {["若手でも早く成長できる教育体制", "工場見学で雰囲気を体感できる", "先輩社員が丁寧に教える文化", "地域に根ざした安定経営"].map((item) => (
                <Card key={item} className="p-5">
                  <p className="font-medium text-gray-900">{item}</p>
                  <p className="mt-2 text-sm text-gray-500">高校生にも伝わる言葉で、仕事のイメージを持ちやすく設計しています。</p>
                </Card>
              ))}
            </div>
          </div>
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900">募集職種</h2>
            <div className="mt-4 space-y-4">
              {demoJobs.map((job) => (
                <div key={job.id} className="rounded-xl border border-gray-200 p-4">
                  <p className="font-semibold text-gray-900">{job.title}</p>
                  <p className="mt-1 text-sm text-gray-500">勤務地: {job.location}</p>
                  <Link className="mt-3 inline-block text-sm font-medium text-indigo-600" href={`/company/${demoCompany.slug}/jobs/${job.id}`}>
                    詳細を見る →
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
