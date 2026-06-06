"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const errorMessages: Record<string, string> = {
  supabase_auth_env_missing: "ログイン設定が未完了です。Supabase Auth の設定を確認してください。",
  missing_oauth_code: "認証コードを取得できませんでした。もう一度ログインしてください。",
  missing_auth_token: "認証リンクが不完全です。届いたメールから再度開いてください。",
  auth_email_not_found: "ログインメールアドレスを取得できませんでした。",
  member_role_is_not_assigned: "このメールアドレスはメンバー登録されていません。管理者に /members で追加してもらってください。",
  member_is_disabled: "このメンバーは無効化されています。管理者に確認してください。",
  email_required: "メールアドレスを入力してください。",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const error = searchParams.get("error") || "";
  const emailFromQuery = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailFromQuery);
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message?: string }>({ type: "idle" });

  const displayError = useMemo(() => {
    if (status.type === "error" && status.message) return status.message;
    return error ? (errorMessages[error] ?? error) : "";
  }, [error, status]);

  async function sendMagicLink() {
    setStatus({ type: "loading" });
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next }),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) {
        throw new Error(errorMessages[json.error] ?? json.message ?? json.error ?? "ログインリンク送信に失敗しました。");
      }
      setStatus({ type: "success", message: json.message ?? "Magic Linkを送信しました。" });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "ログインリンク送信に失敗しました。" });
    }
  }

  return (
    <Card className="w-full max-w-sm p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">採用CRM</h1>
        <p className="mt-1 text-sm text-gray-500">招待済みメールへ Magic Link を送ります</p>
      </div>

      <div className="space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <Button type="button" className="w-full" onClick={sendMagicLink} disabled={status.type === "loading"}>
          {status.type === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
          Magic Link を送る
        </Button>

        <div className="rounded-lg bg-indigo-50 p-3 text-xs leading-5 text-indigo-800 ring-1 ring-indigo-200">
          /members に登録済みのメールアドレスだけログインできます。以後は Google 側の個別設定は不要です。
        </div>

        {status.type === "success" && status.message ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-700">
            {status.message}
            {email ? <div className="mt-1 font-semibold">送信先: {email}</div> : null}
          </div>
        ) : null}

        {displayError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
            {displayError}
            {emailFromQuery ? <div className="mt-1 font-semibold">対象メール: {emailFromQuery}</div> : null}
          </div>
        ) : null}
      </div>
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
