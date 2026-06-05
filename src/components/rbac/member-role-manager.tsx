"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, Loader2, PlayCircle, Save, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyMemberRole, fetchWithRole } from "@/lib/rbac-client";
import { roleDefinitions, type RecruitingRoleId } from "@/lib/rbac";

type MemberRole = {
  id: string;
  name: string | null;
  email: string;
  roleId: RecruitingRoleId;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type State =
  | { type: "idle" }
  | { type: "loading"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function MemberRoleManager() {
  const [members, setMembers] = useState<MemberRole[]>([]);
  const [state, setState] = useState<State>({ type: "idle" });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState<RecruitingRoleId>("interviewer");

  const activeMembers = useMemo(() => members.filter((member) => member.active).length, [members]);

  useEffect(() => {
    void loadMembers();
  }, []);

  async function loadMembers() {
    setState({ type: "loading", message: "メンバーを読み込み中..." });
    try {
      const response = await fetchWithRole("/api/rbac/members", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error ?? "メンバーを取得できませんでした。");
      setMembers((json.members ?? []) as MemberRole[]);
      setState({ type: "idle" });
    } catch (error) {
      setMembers([]);
      setState({ type: "error", message: error instanceof Error ? error.message : "メンバーを取得できませんでした。" });
    }
  }

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setState({ type: "error", message: "メールアドレスを入力してください。" });
      return;
    }

    setState({ type: "loading", message: "メンバーを保存中..." });
    try {
      const response = await fetchWithRole("/api/rbac/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, roleId, active: true }),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error ?? "保存できませんでした。");
      setName("");
      setEmail("");
      setRoleId("interviewer");
      await loadMembers();
      setState({ type: "success", message: "メンバーのロールを保存しました。" });
    } catch (error) {
      setState({ type: "error", message: error instanceof Error ? error.message : "保存できませんでした。" });
    }
  }

  async function updateMember(member: MemberRole, patch: Partial<Pick<MemberRole, "name" | "roleId" | "active">>) {
    const nextMember = { ...member, ...patch };
    setMembers((current) => current.map((item) => (item.id === member.id ? nextMember : item)));
    setState({ type: "loading", message: "ロールを更新中..." });
    try {
      const response = await fetchWithRole("/api/rbac/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, ...patch }),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error ?? "更新できませんでした。");
      setMembers((current) => current.map((item) => (item.id === member.id ? json.member : item)));
      setState({ type: "success", message: "ロールを更新しました。" });
    } catch (error) {
      setMembers((current) => current.map((item) => (item.id === member.id ? member : item)));
      setState({ type: "error", message: error instanceof Error ? error.message : "更新できませんでした。" });
    }
  }

  async function deleteMember(member: MemberRole) {
    if (!window.confirm(`${member.email} のロール設定を削除します。よろしいですか？`)) return;
    setState({ type: "loading", message: "削除中..." });
    try {
      const response = await fetchWithRole(`/api/rbac/members?id=${encodeURIComponent(member.id)}`, { method: "DELETE" });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error ?? "削除できませんでした。");
      setMembers((current) => current.filter((item) => item.id !== member.id));
      setState({ type: "success", message: "ロール設定を削除しました。" });
    } catch (error) {
      setState({ type: "error", message: error instanceof Error ? error.message : "削除できませんでした。" });
    }
  }

  function previewAs(member: MemberRole) {
    applyMemberRole(member.email, member.roleId);
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <Card className="grid gap-5 p-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-700">
            <UserPlus className="size-4" />
            Role Assignment
          </div>
          <h3 className="mt-2 text-base font-semibold text-gray-900">メンバーにロールを割り当てる</h3>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            メールアドレス単位で採用CRMロールを保存します。ログイン連携前のため、「このメンバーで確認」から保存済みロールを画面プレビューへ反映します。
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-gray-50 p-3 ring-1 ring-gray-200">
              <p className="text-xs text-gray-500">登録メンバー</p>
              <p className="mt-1 text-2xl font-bold text-gray-950">{members.length}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 ring-1 ring-gray-200">
              <p className="text-xs text-gray-500">有効</p>
              <p className="mt-1 text-2xl font-bold text-gray-950">{activeMembers}</p>
            </div>
          </div>
        </div>

        <form className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200" onSubmit={addMember}>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="member-name">名前</Label>
              <Input id="member-name" className="mt-2 bg-white" value={name} onChange={(event) => setName(event.target.value)} placeholder="山田 太郎" />
            </div>
            <div>
              <Label htmlFor="member-email">メールアドレス</Label>
              <Input id="member-email" className="mt-2 bg-white" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="member@example.com" required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="member-role">ロール</Label>
              <select
                id="member-role"
                value={roleId}
                onChange={(event) => setRoleId(event.target.value as RecruitingRoleId)}
                className="mt-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                {roleDefinitions.map((role) => (
                  <option key={role.id} value={role.id}>{role.label}</option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" className="mt-4" disabled={state.type === "loading"}>
            {state.type === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            追加/更新する
          </Button>
        </form>
      </Card>

      {state.type !== "idle" ? (
        <div className={state.type === "error" ? "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" : state.type === "success" ? "rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" : "rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600"}>
          {state.message}
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">ロール割当一覧</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left font-medium text-gray-500">名前</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">メール</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">ロール</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">状態</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    登録済みメンバーはまだありません。上のフォームから実メンバーを追加してください。
                  </td>
                </tr>
              ) : null}
              {members.map((member) => (
                <tr key={member.id} className={!member.active ? "bg-gray-50/70 text-gray-400" : "bg-white"}>
                  <td className="px-6 py-4">
                    <Input
                      value={member.name ?? ""}
                      onChange={(event) => setMembers((current) => current.map((item) => item.id === member.id ? { ...item, name: event.target.value } : item))}
                      onBlur={(event) => updateMember(member, { name: event.target.value })}
                      placeholder="未登録"
                      className="h-9 min-w-40 bg-white"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{member.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={member.roleId}
                      onChange={(event) => updateMember(member, { roleId: event.target.value as RecruitingRoleId })}
                      className="h-9 min-w-72 rounded-lg border border-gray-200 bg-white px-2 text-sm"
                    >
                      {roleDefinitions.map((role) => (
                        <option key={role.id} value={role.id}>{role.label}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-400">{member.roleId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => updateMember(member, { active: !member.active })}
                      className={member.active ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200" : "inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-500 ring-1 ring-gray-200"}
                    >
                      {member.active ? <Check className="size-3" /> : null}
                      {member.active ? "有効" : "無効"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => previewAs(member)} disabled={!member.active}>
                        <PlayCircle className="size-3.5" />
                        このメンバーで確認
                      </Button>
                      <Button type="button" variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => deleteMember(member)}>
                        <Trash2 className="size-3.5" />
                        削除
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-base font-semibold text-gray-900">運用メモ</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-600">
          <li>右上の権限切替は引き続き動作確認用です。</li>
          <li>ログイン/ユーザー認証と接続後は、ログイン中ユーザーのメールアドレスから保存済みロールを自動適用します。</li>
          <li>保存済みロールの権限制御は、既存のAPI/UIガードと同じロール定義を使います。</li>
        </ul>
      </Card>
    </div>
  );
}
