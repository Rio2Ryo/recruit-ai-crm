import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { demoMembers, memberRoleMatrix } from "@/lib/demo-data";
import { ShieldCheck } from "lucide-react";

const roleClass: Record<string, string> = {
  owner: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  admin: "bg-violet-50 text-violet-700 ring-violet-200",
  recruiter: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  viewer: "bg-gray-100 text-gray-600 ring-gray-200",
  member: "bg-gray-100 text-gray-600 ring-gray-200",
};

export default function MembersPage() {
  const members = demoMembers;

  return (
    <>
      <Header title="メンバー・権限管理" />
      <div className="max-w-6xl space-y-6 p-6">
        <Card className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-700">
              <ShieldCheck className="size-4" />
              Access Control
            </div>
            <h2 className="mt-2 text-base font-semibold text-gray-900">チームメンバーと管理権限</h2>
            <p className="mt-1 text-sm text-gray-500">
              ユーザー管理・LINE管理・履歴書閲覧/編集を役割ごとに分けます。
            </p>
          </div>
          <Button disabled>メンバーを招待（近日対応）</Button>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-semibold text-gray-900">現在のメンバー</h3>
          </div>
          {members.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              まだメンバーがいません。
              <br />
              オーナーとしてログインしています。
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left font-medium text-gray-500">名前</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">メール</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">権限</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">許可</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">参加日</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.email} className="border-b border-gray-100 last:border-0">
                      <td className="px-6 py-4 font-medium text-gray-900">{m.name || "-"}</td>
                      <td className="px-6 py-4 text-gray-600">{m.email}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${roleClass[m.role]}`}>
                          {m.roleLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex max-w-md flex-wrap gap-1.5">
                          {m.permissions.map((permission) => (
                            <span key={permission} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                              {permission}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{m.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-base font-semibold text-gray-900">推奨ロール設計</h3>
          <p className="mt-1 text-sm text-gray-500">
            LINE公式アカウント・履歴書DBを扱うため、通常のメンバー権限に加えて管理系権限を明示します。
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {memberRoleMatrix.map((role) => (
              <div key={role.role} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-bold text-gray-950">{role.label}</h4>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${roleClass[role.role]}`}>
                    {role.role}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{role.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {role.permissions.map((permission) => (
                    <span key={permission} className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
