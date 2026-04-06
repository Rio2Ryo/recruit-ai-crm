import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";

export default function MembersPage() {
  // TODO: Fetch members from API
  const members: { name: string; email: string; role: string; createdAt: string }[] = [];

  return (
    <>
      <Header title="メンバー管理" />
      <div className="p-6 max-w-3xl">
        <Card className="p-6">
          {members.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              まだメンバーがいません。
              <br />
              オーナーとしてログインしています。
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-medium">名前</th>
                  <th className="text-left py-2 text-gray-500 font-medium">メール</th>
                  <th className="text-left py-2 text-gray-500 font-medium">権限</th>
                  <th className="text-left py-2 text-gray-500 font-medium">参加日</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 text-gray-900">{m.name || "-"}</td>
                    <td className="py-3 text-gray-600">{m.email}</td>
                    <td className="py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          m.role === "owner"
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {m.role === "owner" ? "オーナー" : "メンバー"}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{m.createdAt}</td>
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
