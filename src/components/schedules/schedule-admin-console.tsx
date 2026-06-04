"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock, Plus, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RecruitingRoleId } from "@/lib/rbac";

type ScheduleEvent = {
  id: string;
  type: "interview" | "briefing" | "other";
  title: string;
  description?: string;
  location?: string;
  onlineUrl?: string;
  ownerName?: string;
  isPublic: boolean;
  deadlineAt?: string;
  slots: {
    id: string;
    eventId: string;
    startsAt: string;
    endsAt: string;
    capacity: number;
    bookedCount: number;
    status: string;
    bookings: {
      id: string;
      applicantId?: string;
      lineUserId?: string;
      applicantName?: string;
      note?: string;
    }[];
  }[];
};

const roleOptions: { id: RecruitingRoleId; label: string }[] = [
  { id: "executive", label: "代表/管理者" },
  { id: "recruiting_lead", label: "採用責任者" },
  { id: "assistant_scheduler", label: "日程調整担当" },
  { id: "interviewer", label: "面接官" },
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function fetchScheduleEvents(role: RecruitingRoleId) {
  const response = await fetch("/api/schedules/events", {
    headers: { "x-rbac-role": role },
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error ?? `${response.status}`);
  }
  return (json.events ?? []) as ScheduleEvent[];
}

export function ScheduleAdminConsole() {
  const [role, setRole] = useState<RecruitingRoleId>("executive");
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [message, setMessage] = useState("");

  const slots = useMemo(
    () => events.flatMap((event) => event.slots.map((slot) => ({ ...slot, eventTitle: event.title }))),
    [events]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const nextEvents = await fetchScheduleEvents(role);
        if (cancelled) return;
        setEvents(nextEvents);
        setSelectedEventId((current) => current || nextEvents[0]?.id || "");
        setSelectedSlotId((current) => current || nextEvents[0]?.slots?.[0]?.id || "");
        setMessage("");
      } catch (error) {
        if (!cancelled) setMessage(`権限エラー: ${error instanceof Error ? error.message : "unknown"}`);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [role]);

  async function postJson(path: string, body: Record<string, unknown>) {
    const response = await fetch(path, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-rbac-role": role,
      },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    if (!response.ok) {
      setMessage(`保存できませんでした: ${json.error ?? response.status}`);
      return false;
    }
    setMessage("保存しました。");
    const nextEvents = await fetchScheduleEvents(role);
    setEvents(nextEvents);
    return true;
  }

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await postJson("/api/schedules/events", {
      type: form.get("type"),
      title: form.get("title"),
      description: form.get("description"),
      location: form.get("location"),
      onlineUrl: form.get("onlineUrl"),
      ownerName: form.get("ownerName"),
      deadlineAt: form.get("deadlineAt"),
      isPublic: form.get("isPublic") === "on",
    });
    if (ok) event.currentTarget.reset();
  }

  async function createSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await postJson("/api/schedules/slots", {
      eventId: form.get("eventId"),
      startsAt: form.get("startsAt"),
      endsAt: form.get("endsAt"),
      capacity: Number(form.get("capacity") || 1),
    });
    if (ok) event.currentTarget.reset();
  }

  async function createBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await postJson("/api/schedules/bookings", {
      slotId: form.get("slotId"),
      applicantId: form.get("applicantId"),
      lineUserId: form.get("lineUserId"),
      applicantName: form.get("applicantName"),
      note: form.get("note"),
      status: "booked",
    });
    if (ok) event.currentTarget.reset();
  }

  return (
    <div className="space-y-6">
      <Card className="grid gap-4 p-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-700">
            <CalendarDays className="size-4" />
            Schedule Operations
          </div>
          <h2 className="mt-2 text-lg font-semibold text-gray-950">採用日程の作成・予約管理</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            面接/説明会イベント、開催枠、応募者ごとの予約を管理します。現段階は管理画面中心で、DB永続化 migration を本番適用後に公開予約フォームへ拡張できます。
          </p>
        </div>
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-4">
          <Label htmlFor="role-preview" className="text-indigo-900">
            権限プレビュー
          </Label>
          <select
            id="role-preview"
            value={role}
            onChange={(event) => setRole(event.target.value as RecruitingRoleId)}
            className="mt-2 h-9 w-full rounded-lg border border-indigo-200 bg-white px-2 text-sm"
          >
            {roleOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-5 text-indigo-800">
            面接官は閲覧のみ、日程調整担当以上はイベント/予約を登録できます。
          </p>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            <Plus className="size-4 text-indigo-600" />
            イベント作成
          </div>
          <form className="mt-4 space-y-3" onSubmit={createEvent}>
            <div>
              <Label htmlFor="event-title">タイトル</Label>
              <Input id="event-title" name="title" placeholder="一次面接 / 会社説明会" required />
            </div>
            <div>
              <Label htmlFor="event-type">種別</Label>
              <select id="event-type" name="type" className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm">
                <option value="interview">面接</option>
                <option value="briefing">説明会</option>
                <option value="other">その他</option>
              </select>
            </div>
            <div>
              <Label htmlFor="event-location">場所/オンラインURL</Label>
              <Input id="event-location" name="location" placeholder="本社3F / オンライン" />
              <Input name="onlineUrl" className="mt-2" placeholder="https://meet.example.com/..." />
            </div>
            <div>
              <Label htmlFor="event-owner">担当者</Label>
              <Input id="event-owner" name="ownerName" placeholder="採用担当 山田" />
            </div>
            <div>
              <Label htmlFor="event-deadline">締切</Label>
              <Input id="event-deadline" name="deadlineAt" type="datetime-local" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input name="isPublic" type="checkbox" className="size-4 rounded border-gray-300" />
              公開予約フォーム候補
            </label>
            <Button type="submit" className="w-full">
              作成
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            <Clock className="size-4 text-indigo-600" />
            枠作成
          </div>
          <form className="mt-4 space-y-3" onSubmit={createSlot}>
            <div>
              <Label htmlFor="slot-event">対象イベント</Label>
              <select
                id="slot-event"
                name="eventId"
                value={selectedEventId}
                onChange={(event) => setSelectedEventId(event.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm"
                required
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="slot-start">開始</Label>
              <Input id="slot-start" name="startsAt" type="datetime-local" required />
            </div>
            <div>
              <Label htmlFor="slot-end">終了</Label>
              <Input id="slot-end" name="endsAt" type="datetime-local" required />
            </div>
            <div>
              <Label htmlFor="slot-capacity">定員</Label>
              <Input id="slot-capacity" name="capacity" type="number" min="1" defaultValue="1" required />
            </div>
            <Button type="submit" className="w-full">
              枠を追加
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 font-semibold text-gray-900">
            <Users className="size-4 text-indigo-600" />
            応募者予約
          </div>
          <form className="mt-4 space-y-3" onSubmit={createBooking}>
            <div>
              <Label htmlFor="booking-slot">予約枠</Label>
              <select
                id="booking-slot"
                name="slotId"
                value={selectedSlotId}
                onChange={(event) => setSelectedSlotId(event.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm"
                required
              >
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.eventTitle} / {formatDateTime(slot.startsAt)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="booking-name">応募者名</Label>
              <Input id="booking-name" name="applicantName" placeholder="山田 花子" />
            </div>
            <div>
              <Label htmlFor="booking-applicant">候補者ID / LINE ID</Label>
              <Input id="booking-applicant" name="applicantId" placeholder="候補者ID" />
              <Input name="lineUserId" className="mt-2" placeholder="LINE userId" />
            </div>
            <div>
              <Label htmlFor="booking-note">メモ</Label>
              <textarea
                id="booking-note"
                name="note"
                className="mt-1 min-h-20 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="連絡済み、希望時間など"
              />
            </div>
            <Button type="submit" className="w-full">
              予約登録
            </Button>
          </form>
        </Card>
      </div>

      {message && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-800">
          {message}
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">イベント/枠/予約状況</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {events.map((event) => (
            <div key={event.id} className="p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-gray-950">{event.title}</h4>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {event.type === "interview" ? "面接" : event.type === "briefing" ? "説明会" : "その他"}
                    </span>
                    {event.isPublic && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        公開候補
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {event.location ?? "場所未設定"} {event.onlineUrl ? `/ ${event.onlineUrl}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    担当: {event.ownerName ?? "未設定"} / 締切: {event.deadlineAt ? formatDateTime(event.deadlineAt) : "未設定"}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <ShieldCheck className="size-4 text-slate-500" />
                  {event.slots.length}枠
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {event.slots.map((slot) => (
                  <div key={slot.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium text-gray-900">
                        {formatDateTime(slot.startsAt)} - {formatDateTime(slot.endsAt)}
                      </div>
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                        {slot.bookedCount}/{slot.capacity}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {slot.bookings.length === 0 ? (
                        <p className="text-sm text-gray-400">予約はまだありません。</p>
                      ) : (
                        slot.bookings.map((booking) => (
                          <div key={booking.id} className="rounded bg-gray-50 px-3 py-2 text-sm">
                            <div className="flex items-center gap-2 font-medium text-gray-900">
                              <CheckCircle2 className="size-3.5 text-emerald-600" />
                              {booking.applicantName || booking.lineUserId || booking.applicantId || "応募者未設定"}
                            </div>
                            {booking.note && <p className="mt-1 text-xs text-gray-500">{booking.note}</p>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
