"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PublicApplyPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const selectedJobId = searchParams.get("jobId") ?? "";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href={`/company/${params.slug}`} className="text-sm font-medium text-indigo-600">← 企業ページに戻る</Link>
        <Card className="mt-6 p-8">
          <p className="text-sm font-medium text-indigo-600">簡易応募フォーム</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">採用応募フォーム</h1>
          <p className="mt-3 text-sm text-gray-500">登録済み情報だけを扱います。ダミー企業・求人は表示していません。</p>

          <form className="mt-8 space-y-5">
            <div>
              <Label htmlFor="job">応募職種</Label>
              <Input id="job" defaultValue={selectedJobId} placeholder="希望職種を入力" className="mt-2" />
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div><Label htmlFor="name">氏名</Label><Input id="name" placeholder="氏名" className="mt-2" /></div>
              <div><Label htmlFor="school">学校名</Label><Input id="school" placeholder="学校名" className="mt-2" /></div>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div><Label htmlFor="department">学科</Label><Input id="department" placeholder="学科" className="mt-2" /></div>
              <div><Label htmlFor="phone">電話番号</Label><Input id="phone" placeholder="電話番号" className="mt-2" /></div>
            </div>
            <div><Label htmlFor="email">メールアドレス</Label><Input id="email" type="email" placeholder="メールアドレス" className="mt-2" /></div>
            <div><Label htmlFor="selfPr">自己PR</Label><textarea id="selfPr" rows={5} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="自己PR・質問など" /></div>
            <Button type="button" className="w-full" size="lg" disabled>応募送信はLINE応募フォームに統合予定</Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
