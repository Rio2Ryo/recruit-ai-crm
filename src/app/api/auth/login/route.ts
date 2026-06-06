import { NextRequest, NextResponse } from "next/server";
import { ensureMemberCanStartLogin, safeNext } from "@/lib/auth-session";
import { createClient, hasSupabaseAuthEnv } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!hasSupabaseAuthEnv()) {
    return NextResponse.json(
      { ok: false, error: "supabase_auth_env_missing", message: "ログイン設定が未完了です。" },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null) as { email?: string; next?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const next = safeNext(body?.next ?? null);

  const memberCheck = await ensureMemberCanStartLogin(email);
  if (!memberCheck.ok) {
    return NextResponse.json(
      { ok: false, error: memberCheck.error, email: "email" in memberCheck ? memberCheck.email : email },
      { status: memberCheck.error === "email_required" ? 400 : 403 }
    );
  }

  const supabase = await createClient();
  const callbackUrl = new URL("/api/auth/callback", request.url);
  callbackUrl.searchParams.set("next", next);

  const { error } = await supabase.auth.signInWithOtp({
    email: memberCheck.email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
      shouldCreateUser: true,
    },
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message, message: "Magic Linkの送信に失敗しました。" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    email: memberCheck.email,
    message: "ログイン用のMagic Linkを送信しました。メールを確認してください。",
  });
}
