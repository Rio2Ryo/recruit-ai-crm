"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { roleDefinitions, type RecruitingRoleId } from "@/lib/rbac";
import { getActiveRoleId, setActiveRoleId } from "@/lib/rbac-client";

export function RoleSwitcher() {
  const [roleId, setRoleIdState] = useState<RecruitingRoleId>(() => getActiveRoleId());

  function changeRole(nextRoleId: RecruitingRoleId) {
    setRoleIdState(nextRoleId);
    setActiveRoleId(nextRoleId);
    window.location.reload();
  }

  return (
    <label className="hidden items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 lg:flex">
      <ShieldCheck className="size-3.5 text-indigo-500" />
      <span className="font-medium">権限</span>
      <select
        value={roleId}
        onChange={(event) => changeRole(event.target.value as RecruitingRoleId)}
        className="max-w-44 bg-transparent text-xs font-semibold text-gray-900 outline-none"
      >
        {roleDefinitions.map((role) => (
          <option key={role.id} value={role.id}>{role.label}</option>
        ))}
      </select>
    </label>
  );
}
