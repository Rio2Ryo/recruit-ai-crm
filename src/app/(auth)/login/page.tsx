"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const errorMessages: Record<string, string> = {
  member_role_is_not_assigned: "このメールアドレスはメンバー登録されていません。管理者に /members で追加してもらってください。",
  member_is_disabled: "このメンバーは無効化されています。管理者に確認してください。",
  email_required: "メールアドレスを入力してください。",
  invite_code_required: "招待コードを入力してください。",
  invite_code_invalid: "招待コードが正しくありません。",
  invite_code_not_configured: "招待コードが未設定です。管理者設定を確認してください。",
  auth_email_not_found: "ログインメールアドレスを取得できませんでした。",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const error = searchParams.get("error") || "";
  const emailFromQuery = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailFromQuery);
  const [inviteCode, setInviteCode] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message?: string }>({ type: "idle" });

  const displayError = useMemo(() => {
    if (status.type === "error" && status.message) return status.message;
    return error ? (errorMessages[error] ?? error) : "";
  }, [error, status]);

  async function login() {
    setStatus({ type: "loading" });
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, inviteCode, next }),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) {
        throw new Error(errorMessages[json.error] ?? json.message ?? json.error ?? "ログインに失敗しました。");
      }
      setStatus({ type: "success", message: json.message ?? "ログインしました。" });
      router.push(json.next || next);
      router.refresh();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "ログインに失敗しました。" });
    }
  }

  return (
    <Card className="w-full max-w-sm p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">採用CRM</h1>
        <p className="mt-1 text-sm text-gray-500">メールアドレスと招待コードでログイン</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); login(); }} className="space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <Input
          type="password"
          value={inviteCode}
          onChange={(event) => setInviteCode(event.target.value)}
          placeholder="招待コード"
          autoComplete="one-time-code"
        />

        <Button type="submit" className="w-full" disabled={status.type === "loading"}>
          {status.type === "loading" ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
          ログイン
        </Button>

        <div className="rounded-lg bg-indigo-50 p-3 text-xs leading-5 text-indigo-800 ring-1 ring-indigo-200">
          /members に登録済みのメールアドレスと、共有された招待コードが一致した場合のみログインできます。
        </div>

        {status.type === "success" && status.message ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-700">
            {status.message}
          </div>
        ) : null}

        {displayError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
            {displayError}
            {emailFromQuery ? <div className="mt-1 font-semibold">対象メール: {emailFromQuery}</div> : null}
          </div>
        ) : null}
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
