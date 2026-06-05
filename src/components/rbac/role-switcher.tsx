"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { roleDefinitions, type RecruitingRoleId } from "@/lib/rbac";
import { applyMemberRole, getActiveRoleId, setActiveRoleId } from "@/lib/rbac-client";

type AuthMember = {
  email: string;
  roleId: RecruitingRoleId;
};

export function RoleSwitcher() {
  const [roleId, setRoleIdState] = useState<RecruitingRoleId>(() => getActiveRoleId());
  const [memberEmail, setMemberEmail] = useState("");
  const [authenticatedRoleId, setAuthenticatedRoleId] = useState<RecruitingRoleId | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((json) => {
        if (cancelled || !json?.authenticated || !json.member) return;
        const member = json.member as AuthMember;
        setMemberEmail(member.email);
        setAuthenticatedRoleId(member.roleId);
        if (member.roleId !== getActiveRoleId()) {
          applyMemberRole(member.email, member.roleId);
          window.location.reload();
          return;
        }
        applyMemberRole(member.email, member.roleId);
        setRoleIdState(member.roleId);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  function changeRole(nextRoleId: RecruitingRoleId) {
    if (authenticatedRoleId && authenticatedRoleId !== "executive") return;
    setRoleIdState(nextRoleId);
    setActiveRoleId(nextRoleId);
    window.location.reload();
  }

  const canPreviewOtherRoles = !authenticatedRoleId || authenticatedRoleId === "executive";

  return (
    <label className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600" title={memberEmail ? `ログイン中: ${memberEmail}` : "権限プレビュー"}>
      <ShieldCheck className="size-3.5 text-indigo-500" />
      <span className="font-medium">権限</span>
      <select
        value={roleId}
        onChange={(event) => changeRole(event.target.value as RecruitingRoleId)}
        disabled={!canPreviewOtherRoles}
        className="max-w-32 bg-transparent text-xs font-semibold text-gray-900 outline-none disabled:cursor-not-allowed disabled:text-gray-500 xl:max-w-44"
      >
        {roleDefinitions.map((role) => (
          <option key={role.id} value={role.id}>{role.label}</option>
        ))}
      </select>
    </label>
  );
}
