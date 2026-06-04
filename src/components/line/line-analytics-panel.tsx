"use client";

import { useEffect, useState } from "react";
import { Activity, CalendarClock, FileText, MessageSquare, Users } from "lucide-react";

type Analytics = {
  totals: { applicants: number; events: number; messages: number; documents: number };
  byType: Record<string, number>;
  byStage: Record<string, number>;
  recentEvents: Array<{ id: string; type: string; label: string; createdAt: string }>;
  documents: Array<{ id: string; fileName?: string; storageUrl?: string; savedAt: string }>;
};

export function LineAnalyticsPanel() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/line/analytics", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((json) => setAnalytics(json?.analytics ?? null))
      .catch(() => setAnalytics(null));
  }, []);

  const totals = analytics?.totals ?? { applicants: 0, events: 0, messages: 0, documents: 0 };
  const cards = [
    { label: "LINE応募者", value: totals.applicants, icon: Users },
    { label: "アクション", value: totals.events, icon: Activity },
    { label: "送信ログ", value: totals.messages, icon: MessageSquare },
    { label: "保存書類", value: totals.documents, icon: FileText },
    { label: "予約送信", value: analytics?.byType?.scheduled_message ?? 0, icon: CalendarClock },
  ];

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center gap-2">
        <Activity className="size-4 text-indigo-500" />
        <h2 className="text-base font-bold text-gray-950">LINEアクション分析</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        友だち追加、フォーム表示/送信、メッセージ、ステータス変更、書類アップロードを記録します。
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
              <Icon className="size-4 text-indigo-500" />
              <p className="mt-2 text-2xl font-bold text-gray-950">{card.value}</p>
              <p className="text-xs font-semibold text-gray-500">{card.label}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
          <h3 className="text-sm font-bold text-gray-950">最近のアクション</h3>
          <div className="mt-3 space-y-2">
            {(analytics?.recentEvents ?? []).slice(0, 6).map((event) => (
              <div key={event.id} className="rounded-lg bg-white px-3 py-2 text-xs ring-1 ring-gray-200">
                <p className="font-bold text-gray-900">{event.label}</p>
                <p className="text-gray-500">{event.type} / {event.createdAt}</p>
              </div>
            ))}
            {analytics?.recentEvents?.length ? null : <p className="text-sm text-gray-500">まだ記録はありません。</p>}
          </div>
        </div>
        <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200">
          <h3 className="text-sm font-bold text-gray-950">保存書類</h3>
          <div className="mt-3 space-y-2">
            {(analytics?.documents ?? []).slice(0, 6).map((doc) => (
              <div key={doc.id} className="rounded-lg bg-white px-3 py-2 text-xs ring-1 ring-gray-200">
                <p className="font-bold text-gray-900">{doc.fileName ?? doc.id}</p>
                {doc.storageUrl ? <a className="text-indigo-600 hover:underline" href={doc.storageUrl}>開く</a> : null}
                <p className="text-gray-500">{doc.savedAt}</p>
              </div>
            ))}
            {analytics?.documents?.length ? null : <p className="text-sm text-gray-500">保存書類はまだありません。</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
