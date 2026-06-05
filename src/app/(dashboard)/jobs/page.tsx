import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function JobsPage() {
  return (
    <>
      <Header title="求人管理" />
      <div className="p-6 max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">公開中の求人</h2>
            <p className="text-sm text-gray-500">登録された求人だけを表示します。ダミーデータは表示していません。</p>
          </div>
          <Button disabled>求人を追加</Button>
        </div>

        <Card className="border-dashed p-10 text-center text-sm text-gray-500">
          登録済み求人はまだありません。
        </Card>
      </div>
    </>
  );
}
