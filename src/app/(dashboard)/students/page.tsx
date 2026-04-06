import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { demoStudents } from "@/lib/demo-data";

export default function StudentsPage() {
  return (
    <>
      <Header title="候補者管理" />
      <div className="p-6 max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">候補者一覧</h2>
            <p className="text-sm text-gray-500">学校情報・選考状況・AIマッチ度を一覧で確認できます。</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>CSV取込</Button>
            <Button disabled>候補者を追加</Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-gray-500 font-medium">氏名</th>
                <th className="px-6 py-3 text-left text-gray-500 font-medium">学校</th>
                <th className="px-6 py-3 text-left text-gray-500 font-medium">学科</th>
                <th className="px-6 py-3 text-left text-gray-500 font-medium">選考状況</th>
                <th className="px-6 py-3 text-left text-gray-500 font-medium">AIマッチ度</th>
              </tr>
            </thead>
            <tbody>
              {demoStudents.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-gray-600">{student.school}</td>
                  <td className="px-6 py-4 text-gray-600">{student.department}</td>
                  <td className="px-6 py-4"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">{student.status}</span></td>
                  <td className="px-6 py-4 font-semibold text-indigo-600">{student.score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
