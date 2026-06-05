import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function MatchingPage() {
  return (
    <>
      <Header title="AIマッチング" />
      <div className="p-6 max-w-6xl space-y-6">
        <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-700">
            <Sparkles className="size-4" />
            AI Matching
          </div>
          <h2 className="mt-2 text-xl font-bold text-slate-950">実データに基づく候補者マッチング</h2>
          <p className="mt-1 text-sm text-slate-600">
            候補者・求人・履歴書が登録された後に分析結果を表示します。ダミー候補者は表示していません。
          </p>
        </Card>

        <Card className="border-dashed p-10 text-center text-sm text-gray-500">
          AIマッチング対象の実データはまだありません。
        </Card>
      </div>
    </>
  );
}
