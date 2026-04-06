import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <>
      <Header title="ダッシュボード" />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">候補者数</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">応募数</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">面接予定</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">内定数</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            最近のアクティビティ
          </h2>
          <div className="text-center py-12 text-gray-400 text-sm">
            まだアクティビティがありません。
            <br />
            候補者の登録や求人の作成から始めましょう。
          </div>
        </Card>
      </div>
    </>
  );
}
