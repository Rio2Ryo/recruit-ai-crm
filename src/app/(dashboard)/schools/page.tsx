import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { demoSchools } from "@/lib/demo-data";

export default function SchoolsPage() {
  return (
    <>
      <Header title="学校CRM" />
      <div className="p-6 max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">学校との接点管理</h2>
            <p className="text-sm text-gray-500">進路指導担当との接点や次回アクションを記録できます。</p>
          </div>
          <Button disabled>学校を追加</Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {demoSchools.map((school) => (
            <Card key={school.id} className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">{school.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{school.contact}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-gray-500">関連候補者</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{school.students}</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-4">
                  <p className="text-amber-700">次回アクション</p>
                  <p className="mt-1 font-medium text-amber-900">{school.nextAction}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
