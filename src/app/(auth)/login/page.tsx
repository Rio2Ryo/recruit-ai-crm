"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const errorMessages: Record<string, string> = {
  supabase_auth_env_missing: "Googleログイン設定が未完了です。Supabase URL / Anon Key をVercelに設定してください。",
  missing_oauth_code: "Google認証コードを取得できませんでした。もう一度ログインしてください。",
  google_email_not_found: "Googleアカウントのメールアドレスを取得できませんでした。",
  member_role_is_not_assigned: "このGoogleメールアドレスはメンバー登録されていません。管理者に /members で追加してもらってください。",
  member_is_disabled: "このメンバーは無効化されています。管理者に確認してください。",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const error = searchParams.get("error") || "";
  const email = searchParams.get("email") || "";
  const googleLoginUrl = `/api/auth/google?next=${encodeURIComponent(next)}`;

  return (
    <Card className="w-full max-w-sm p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">採用CRM</h1>
        <p className="mt-1 text-sm text-gray-500">Googleアカウントでログイン</p>
      </div>

      <div className="space-y-4">
        <Button type="button" className="w-full" onClick={() => { window.location.href = googleLoginUrl; }}>
          <LogIn className="size-4" />
          Googleでログイン
        </Button>

        <div className="rounded-lg bg-indigo-50 p-3 text-xs leading-5 text-indigo-800 ring-1 ring-indigo-200">
          Googleのメールアドレスが /members に登録されている場合のみログインできます。未登録アカウントは拒否します。
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
            {errorMessages[error] ?? error}
            {email ? <div className="mt-1 font-semibold">対象メール: {email}</div> : null}
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
