import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, error: "email_login_disabled", message: "Googleログインを使用してください。" },
    { status: 410 }
  );
}
