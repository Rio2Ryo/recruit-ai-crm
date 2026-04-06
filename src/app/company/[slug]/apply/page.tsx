"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoCompany, demoJobs } from "@/lib/demo-data";

export default function PublicApplyPage() {
  const searchParams = useSearchParams();
  const selectedJobId = searchParams.get("jobId") ?? demoJobs[0].id;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href={`/company/${demoCompany.slug}`} className="text-sm font-medium text-indigo-600">← 企業ページに戻る</Link>
        <Card className="mt-6 p-8">
          <p className="text-sm font-medium text-indigo-600">簡易応募フォーム</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{demoCompany.name} に応募する</h1>
          <p className="mt-3 text-sm text-gray-500">このデモでは送信は行われません。UI確認用のフォームです。</p>

          <form className="mt-8 space-y-5">
            <div>
              <Label htmlFor="job">応募職種</Label>
              <select id="job" defaultValue={selectedJobId} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {demoJobs.map((job) => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <Label htmlFor="name">氏名</Label>
                <Input id="name" placeholder="山田 太郎" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="school">学校名</Label>
                <Input id="school" placeholder="○○工業高校" className="mt-2" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <Label htmlFor="department">学科</Label>
                <Input id="department" placeholder="機械科" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="phone">電話番号</Label>
                <Input id="phone" placeholder="090-1234-5678" className="mt-2" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input id="email" type="email" placeholder="student@example.com" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="selfPr">自己PR</Label>
              <textarea id="selfPr" rows={5} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="部活動、得意なこと、志望理由などを入力" />
            </div>
            <Button type="button" className="w-full" size="lg">応募内容を確認（デモ）</Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
