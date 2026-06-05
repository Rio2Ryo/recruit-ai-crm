import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListFilter } from "lucide-react";

export default function TasksPage() {
  return (
    <>
      <Header title="タスク管理" />
      <div className="p-6 max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">タスク一覧</h2>
            <p className="text-sm text-gray-500">登録されたタスクだけを表示します。ダミーデータは表示していません。</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled className="gap-2"><ListFilter className="size-4" />フィルター</Button>
            <Button disabled>タスクを追加</Button>
          </div>
        </div>

        <Card className="border-dashed p-10 text-center text-sm text-gray-500">
          登録済みタスクはまだありません。
        </Card>
      </div>
    </>
  );
}
