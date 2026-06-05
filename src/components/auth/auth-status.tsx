"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type Member = {
  name: string | null;
  email: string;
  roleId: string;
};

export function AuthStatus() {
  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((json) => {
        if (!cancelled && json?.authenticated) setMember(json.member as Member);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("recruit-ai-active-role");
    localStorage.removeItem("recruit-ai-active-member-email");
    window.location.href = "/login";
  }

  if (!member) {
    return (
      <div className="ml-1 flex size-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
        山
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden text-right text-xs leading-4 sm:block">
        <p className="font-semibold text-gray-700">{member.name || member.email.split("@")[0]}</p>
        <p className="text-gray-400">{member.roleId}</p>
      </div>
      <div className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
        {(member.name || member.email).charAt(0).toUpperCase()}
      </div>
      <Button type="button" variant="ghost" size="icon-sm" className="text-gray-500" onClick={logout} title="ログアウト">
        <LogOut className="size-4" />
      </Button>
    </div>
  );
}
