import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { MemberRoleManager } from "@/components/rbac/member-role-manager";
import { permissionGroups, roleDefinitions } from "@/lib/rbac";
import { Check, ShieldCheck } from "lucide-react";

const roleTone: Record<string, string> = {
  executive: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  recruiting_lead: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  assistant_line: "bg-sky-50 text-sky-700 ring-sky-200",
  assistant_screening: "bg-amber-50 text-amber-700 ring-amber-200",
  assistant_scheduler: "bg-violet-50 text-violet-700 ring-violet-200",
  assistant_progress: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  legal: "bg-slate-100 text-slate-700 ring-slate-200",
  interviewer: "bg-gray-100 text-gray-600 ring-gray-200",
};

export default function MembersPage() {
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
              応募者情報、履歴書、個人情報、LINE送信、日程調整を役職ごとの権限タグで管理します。
            </p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200">
            実メンバーのみ登録
          </span>
        </Card>

        <MemberRoleManager />

        <Card className="p-6">
          <h3 className="text-base font-semibold text-gray-900">ロール別権限マトリクス</h3>
          <p className="mt-1 text-sm text-gray-500">
            権限はコード定数で一元管理し、API側でも同じタグで判定します。既存ログインは後方互換のため管理者相当をデフォルトにします。
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {roleDefinitions.map((role) => (
              <div key={role.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-bold text-gray-950">{role.label}</h4>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${roleTone[role.id]}`}>
                    {role.id}
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

        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-semibold text-gray-900">権限タグ一覧</h3>
          </div>
          <div className="grid gap-0 divide-y divide-gray-100 md:grid-cols-2 md:divide-x md:divide-y-0">
            {permissionGroups.map((group) => (
              <div key={group.label} className="p-5">
                <h4 className="font-semibold text-gray-900">{group.label}</h4>
                <div className="mt-3 space-y-2">
                  {group.permissions.map((permission) => (
                    <div key={permission.key} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="size-3.5 text-emerald-600" />
                      <span className="font-medium">{permission.label}</span>
                      <span className="text-xs text-gray-400">{permission.key}</span>
                    </div>
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
