"use client";

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoCompany } from "@/lib/demo-data";

type PublicScheduleEvent = {
  id: string;
  type: "interview" | "briefing" | "other";
  title: string;
  description?: string;
  location?: string;
  onlineUrl?: string;
  ownerName?: string;
  deadlineAt?: string;
  slots: {
    id: string;
    startsAt: string;
    endsAt: string;
    capacity: number;
    bookedCount: number;
    status: string;
  }[];
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function eventTypeLabel(type: PublicScheduleEvent["type"]) {
  if (type === "interview") return "面接";
  if (type === "briefing") return "説明会";
  return "その他";
}

function PublicSchedulePageInner() {
  const searchParams = useSearchParams();
  const lineUserId = searchParams.get("lineUserId") ?? "";
  const applicantId = searchParams.get("applicantId") ?? "";
  const [events, setEvents] = useState<PublicScheduleEvent[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [applicantName, setApplicantName] = useState(searchParams.get("name") ?? "");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const selectedSlot = useMemo(
    () => events.flatMap((event) => event.slots.map((slot) => ({ ...slot, event }))).find((slot) => slot.id === selectedSlotId),
    [events, selectedSlotId]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const response = await fetch("/api/public/schedules", { cache: "no-store" });
        const json = await response.json();
        if (cancelled) return;
        const nextEvents = (json.events ?? []) as PublicScheduleEvent[];
        setEvents(nextEvents);
        setSelectedSlotId((current) => current || nextEvents[0]?.slots?.[0]?.id || "");
      } catch {
        if (!cancelled) setMessage("日程を読み込めませんでした。時間をおいて再度お試しください。");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSlotId) return;
    setSending(true);
    setMessage("");
    const response = await fetch("/api/public/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slotId: selectedSlotId,
        applicantId,
        lineUserId,
        applicantName,
        note: [contact ? `連絡先: ${contact}` : "", note].filter(Boolean).join("\n"),
      }),
    });
    const json = await response.json().catch(() => ({}));
    setSending(false);
    if (!response.ok) {
      setMessage(json.error === "slot is not publicly bookable" ? "この枠は満席または受付終了しました。別の枠を選んでください。" : "予約できませんでした。入力内容をご確認ください。");
      return;
    }
    setMessage("予約を受け付けました。担当者からの案内をお待ちください。");
  }

  return (
    <main className="min-h-screen bg-indigo-50/50 px-5 py-8">
      <div className="mx-auto max-w-4xl">
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-700">
            <CalendarDays className="size-4" />
            Recruit Schedule
          </div>
          <h1 className="mt-2 text-2xl font-bold text-gray-950">{demoCompany.name} 日程予約</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            面接・説明会の希望日時を選んで予約してください。公開中で空きがある枠だけ表示されます。
          </p>
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-5">
            <h2 className="font-semibold text-gray-950">予約可能な日程</h2>
            {loading ? <p className="mt-4 text-sm text-gray-500">読み込み中...</p> : null}
            {!loading && events.length === 0 ? (
              <p className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">現在、予約可能な日程はありません。</p>
            ) : null}
            <div className="mt-4 space-y-4">
              {events.map((event) => (
                <div key={event.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">{eventTypeLabel(event.type)}</span>
                    <h3 className="font-semibold text-gray-950">{event.title}</h3>
                  </div>
                  {event.description && <p className="mt-2 text-sm text-gray-600">{event.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                    {event.location && <span className="inline-flex items-center gap-1"><MapPin className="size-3" />{event.location}</span>}
                    {event.deadlineAt && <span>締切: {formatDateTime(event.deadlineAt)}</span>}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {event.slots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`rounded-lg border px-3 py-3 text-left text-sm transition ${selectedSlotId === slot.id ? "border-indigo-500 bg-indigo-50 text-indigo-900" : "border-gray-200 bg-white hover:border-indigo-200"}`}
                      >
                        <span className="flex items-center gap-2 font-medium"><Clock className="size-4" />{formatDateTime(slot.startsAt)}</span>
                        <span className="mt-1 block text-xs text-gray-500">空き {Math.max(0, slot.capacity - slot.bookedCount)} / {slot.capacity}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-gray-950">予約者情報</h2>
            {selectedSlot ? (
              <div className="mt-3 rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
                選択中: {selectedSlot.event.title} / {formatDateTime(selectedSlot.startsAt)}
              </div>
            ) : null}
            <form onSubmit={submit} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="applicantName">氏名 *</Label>
                <Input id="applicantName" className="mt-2" value={applicantName} onChange={(event) => setApplicantName(event.target.value)} required placeholder="山田 太郎" />
              </div>
              <div>
                <Label htmlFor="contact">連絡先</Label>
                <Input id="contact" className="mt-2" value={contact} onChange={(event) => setContact(event.target.value)} placeholder="電話番号またはメール" />
              </div>
              <div>
                <Label htmlFor="note">補足・質問</Label>
                <textarea
                  id="note"
                  className="mt-2 min-h-24 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="希望や質問があれば入力してください"
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={sending || !selectedSlotId}>
                {sending ? "予約中..." : "この日程で予約する"}
              </Button>
            </form>
            {message && (
              <div className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${message.includes("受け付け") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                {message.includes("受け付け") && <CheckCircle2 className="mr-1 inline size-4" />}
                {message}
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}

export default function PublicSchedulePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-indigo-50/50 px-5 py-8" />}>
      <PublicSchedulePageInner />
    </Suspense>
  );
}
