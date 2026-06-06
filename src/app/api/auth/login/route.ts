import { NextRequest, NextResponse } from "next/server";
import { applyAppSession, ensureMemberCanLogin, safeNext } from "@/lib/auth-session";
import { hasInviteCodeConfigured, isValidInviteCode } from "@/lib/invite-code";

export async function POST(request: NextRequest) {
  if (!hasInviteCodeConfigured()) {
    return NextResponse.json(
      { ok: false, error: "invite_code_not_configured", message: "招待コードが未設定です。" },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null) as { email?: string; inviteCode?: string; next?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const inviteCode = body?.inviteCode?.trim() ?? "";
  const next = safeNext(body?.next ?? null);

  const memberCheck = await ensureMemberCanLogin(email);
  if (!memberCheck.ok) {
    return NextResponse.json(
      { ok: false, error: memberCheck.error, email: "email" in memberCheck ? memberCheck.email : email },
      { status: memberCheck.error === "email_required" ? 400 : 403 }
    );
  }

  if (!inviteCode) {
    return NextResponse.json(
      { ok: false, error: "invite_code_required", message: "招待コードを入力してください。" },
      { status: 400 }
    );
  }

  if (!isValidInviteCode(inviteCode)) {
    return NextResponse.json(
      { ok: false, error: "invite_code_invalid", message: "招待コードが正しくありません。" },
      { status: 403 }
    );
  }

  const response = NextResponse.json({
    ok: true,
    email: memberCheck.email,
    next,
    message: "ログインしました。",
  });
  return applyAppSession(response, { email: memberCheck.email, roleId: memberCheck.member.roleId });
}
