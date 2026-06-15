"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


function LineApplyForm() {
  const searchParams = useSearchParams();
  const lineUserId = searchParams.get("lineUserId") ?? "";
  const [sent, setSent] = useState(false);
  const [scheduleUrl, setScheduleUrl] = useState("/schedule");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    school: "",
    department: "",
    phone: "",
    email: "",
    jobId: "",
    selfPr: "",
  });

  useEffect(() => {
    fetch("/api/line/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lineUserId, type: "form_view", label: "応募フォーム表示" }),
    }).catch(() => undefined);
  }, [lineUserId]);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/line/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lineUserId }),
      });
      const json = await response.json().catch(() => ({}));
      if (response.ok) {
        setScheduleUrl(json.scheduleUrl ?? `/schedule?lineUserId=${encodeURIComponent(lineUserId)}`);
        setSent(true);
      } else {
        setError("送信に失敗しました。もう一度お試しください。");
      }
    } catch {
      setError("通信エラーが発生しました。電波の良い場所で再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-[#06c755]/10 px-5 py-10">
        <Card className="mx-auto max-w-xl p-8 text-center">
          <p className="text-sm font-semibold text-[#06c755]">応募受付完了</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">ご応募ありがとうございます</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            担当者が内容を確認します。公開中の面接・会社見学枠がある場合は、このまま希望日時を予約できます。
          </p>
          <Link
            href={scheduleUrl}
            className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#06c755] px-4 text-sm font-semibold text-white transition hover:bg-[#05b54d]"
          >
            面接・見学の日程を予約する
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#06c755]/10 px-5 py-8">
      <Card className="mx-auto max-w-2xl p-6 sm:p-8">
        <p className="text-sm font-semibold text-[#06c755]">LINE応募フォーム</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">採用応募フォーム</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          入力後の連絡はすべて公式LINEで届きます。高校生でもスマホだけで応募できる想定です。
        </p>

        <form onSubmit={submit} className="mt-7 space-y-5">
          <div>
            <Label htmlFor="jobId">希望職種</Label>
            <Input id="jobId" className="mt-2" value={form.jobId} onChange={(e) => update("jobId", e.target.value)} placeholder="希望職種を入力" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">氏名 *</Label>
              <Input id="name" className="mt-2" value={form.name} onChange={(e) => update("name", e.target.value)} required placeholder="氏名" />
            </div>
            <div>
              <Label htmlFor="school">学校名 *</Label>
              <Input id="school" className="mt-2" value={form.school} onChange={(e) => update("school", e.target.value)} required placeholder="○○工業高校" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="department">学科</Label>
              <Input id="department" className="mt-2" value={form.department} onChange={(e) => update("department", e.target.value)} placeholder="機械科" />
            </div>
            <div>
              <Label htmlFor="phone">電話番号</Label>
              <Input id="phone" className="mt-2" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="090-1234-5678" />
            </div>
          </div>

          <div>
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" type="email" className="mt-2" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="student@example.com" />
          </div>

          <div>
            <Label htmlFor="selfPr">自己PR・質問</Label>
            <textarea
              id="selfPr"
              rows={5}
              className="mt-2 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={form.selfPr}
              onChange={(e) => update("selfPr", e.target.value)}
              placeholder="志望理由、会社見学の希望日、質問など"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full bg-[#06c755] hover:bg-[#05b54d]" disabled={loading}>
            {loading ? "送信中..." : "公式LINEで応募する"}
          </Button>
        </form>
      </Card>
    </main>
  );
}

export default function LineApplyPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#06c755]/10 px-5 py-10" />}>
      <LineApplyForm />
    </Suspense>
  );
}
