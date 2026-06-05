"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { applyMemberRole } from "@/lib/rbac-client";
import type { RecruitingRoleId } from "@/lib/rbac";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error ?? "ログインできませんでした。");
      applyMemberRole(json.member.email, json.member.roleId as RecruitingRoleId);
      router.push(searchParams.get("next") || "/dashboard");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "ログインできませんでした。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">採用CRM</h1>
        <p className="mt-1 text-sm text-gray-500">管理画面にログイン</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <Label htmlFor="name">名前</Label>
          <Input id="name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="山田 太郎" />
        </div>
        <div>
          <Label htmlFor="email">メールアドレス</Label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="member@example.com" />
        </div>

        <div className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800 ring-1 ring-amber-200">
          メールアドレスに割り当てられたロールでログインします。メンバー未登録の初回だけ、入力メールを管理者として登録します。
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "ログイン中..." : "ログイン"}
        </Button>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<Card className="w-full max-w-sm p-8 text-sm text-gray-500">読み込み中...</Card>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
