import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { demoApplications } from "@/lib/demo-data";

export default function ApplicationsPage() {
  return (
    <>
      <Header title="選考管理" />
      <div className="p-6 max-w-6xl">
        <Card className="overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">選考一覧</h2>
            <p className="text-sm text-gray-500">応募から内定までのステータスを一覧表示します。</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-gray-500 font-medium">候補者</th>
                <th className="px-6 py-3 text-left text-gray-500 font-medium">求人</th>
                <th className="px-6 py-3 text-left text-gray-500 font-medium">ステータス</th>
                <th className="px-6 py-3 text-left text-gray-500 font-medium">更新日</th>
              </tr>
            </thead>
            <tbody>
              {demoApplications.map((application) => (
                <tr key={application.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-6 py-4 font-medium text-gray-900">{application.student}</td>
                  <td className="px-6 py-4 text-gray-600">{application.job}</td>
                  <td className="px-6 py-4"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">{application.status}</span></td>
                  <td className="px-6 py-4 text-gray-500">{application.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
