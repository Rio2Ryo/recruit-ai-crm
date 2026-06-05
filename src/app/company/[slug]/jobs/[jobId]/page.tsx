import Link from "next/link";
import { Card } from "@/components/ui/card";

export default async function PublicJobDetailPage({ params }: { params: Promise<{ slug: string; jobId: string }> }) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Link href={`/company/${slug}`} className="text-sm font-medium text-indigo-600">← 企業ページに戻る</Link>
        <Card className="mt-6 border-dashed p-10 text-center">
          <h1 className="text-xl font-bold text-gray-900">求人情報は未登録です</h1>
          <p className="mt-2 text-sm text-gray-500">登録済み求人だけを表示します。ダミー求人は表示していません。</p>
        </Card>
      </div>
    </main>
  );
}
