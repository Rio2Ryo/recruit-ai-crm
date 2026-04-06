import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { demoMembers } from "@/lib/demo-data";

export default function MembersPage() {
  const members = demoMembers;

  return (
    <>
      <Header title="メンバー管理" />
      <div className="p-6 max-w-5xl space-y-6">
        <Card className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">チームメンバー</h2>
            <p className="text-sm text-gray-500 mt-1">採用担当・総務・現場責任者の閲覧権限を今後追加できます。</p>
          </div>
          <Button disabled>メンバーを招待（近日対応）</Button>
        </Card>

        <Card className="overflow-hidden">
          {members.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              まだメンバーがいません。
              <br />
              オーナーとしてログインしています。
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">名前</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">メール</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">権限</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">参加日</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.email} className="border-b border-gray-100 last:border-0">
                    <td className="px-6 py-4 text-gray-900 font-medium">{m.name || "-"}</td>
                    <td className="px-6 py-4 text-gray-600">{m.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          m.role === "owner"
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {m.role === "owner" ? "オーナー" : "メンバー"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{m.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </>
  );
}
