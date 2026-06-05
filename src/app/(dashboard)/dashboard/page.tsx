"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { funnelStages, type FunnelStage } from "@/lib/recruiting-stages";
import { ArrowUpRight, BarChart3, Briefcase, GraduationCap, TrendingUp, Users, CalendarCheck, Award } from "lucide-react";

type StudentRow = {
  id: string;
  name: string;
  school: string;
  department: string;
  status: FunnelStage;
  score?: number;
  source?: string;
  jobTitle?: string;
  updatedAt?: string;
};

const stageColors: Record<FunnelStage, string> = {
  LINE流入: "#6366f1",
  応募: "#8b5cf6",
  書類選考: "#a855f7",
  一次面接: "#d946ef",
  最終面接: "#ec4899",
  内定: "#f43f5e",
  入社: "#10b981",
};

export default function DashboardPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/line/applicants", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const json = await response.json();
        setStudents(json.students ?? []);
      })
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const byStage = Object.fromEntries(funnelStages.map((stage) => [stage, 0])) as Record<FunnelStage, number>;
    students.forEach((student) => {
      if (student.status in byStage) byStage[student.status] += 1;
    });
    return byStage;
  }, [students]);

  const total = students.length;
  const interviews = counts["一次面接"] + counts["最終面接"];
  const offers = counts["内定"];
  const statCards = [
    { label: "LINE流入数", value: total, change: "実データ", changeLabel: loading ? "読込中" : "現在", icon: GraduationCap, iconBg: "bg-indigo-50", iconColor: "text-indigo-600" },
    { label: "応募数", value: counts["応募"], change: "実データ", changeLabel: "応募ステージ", icon: Users, iconBg: "bg-violet-50", iconColor: "text-violet-600" },
    { label: "面接中", value: interviews, change: "実データ", changeLabel: "一次+最終", icon: CalendarCheck, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
    { label: "内定数", value: offers, change: total ? `${((offers / total) * 100).toFixed(1)}%` : "0.0%", changeLabel: "歩留まり率", icon: Award, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  ];

  const recentStudents = students.slice(0, 5);
  const maxCount = Math.max(total, 1);

  return (
    <>
      <Header title="ダッシュボード" />
      <div className="p-6 space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="group relative overflow-hidden rounded-xl bg-white p-5 ring-1 ring-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`flex size-10 items-center justify-center rounded-xl ${stat.iconBg}`}>
                    <Icon className={`size-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <TrendingUp className="size-3.5 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600">{stat.change}</span>
                  <span className="text-xs text-gray-400">{stat.changeLabel}</span>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-xl bg-white p-6 ring-1 ring-gray-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">採用ファネル（実データ）</h2>
                <p className="mt-0.5 text-xs text-gray-500">LINE応募で保存された候補者のみを表示</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400"><BarChart3 className="size-3.5" />実DB</div>
            </div>
            <div className="space-y-2.5">
              {funnelStages.map((stage) => {
                const count = counts[stage];
                const widthPercent = (count / maxCount) * 100;
                const yieldPercent = total ? ((count / total) * 100).toFixed(1) : "0.0";
                return (
                  <div key={stage} className="flex items-center gap-3">
                    <span className="w-[4.5rem] shrink-0 text-right text-xs font-medium text-gray-600">{stage}</span>
                    <div className="relative flex-1 h-7 rounded-md bg-gray-100">
                      <div className="absolute inset-y-0 left-0 rounded-md" style={{ width: `${widthPercent}%`, backgroundColor: stageColors[stage], minWidth: count ? "2rem" : "0" }} />
                      <div className="absolute inset-y-0 left-0 right-0 flex items-center"><span className="ml-2 text-[11px] font-semibold text-gray-700">{count}</span></div>
                    </div>
                    <span className="w-12 shrink-0 text-right text-xs font-medium text-gray-500">{yieldPercent}%</span>
                  </div>
                );
              })}
            </div>
            {!loading && total === 0 && <p className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">まだ応募者データがありません。ダミーデータは表示していません。</p>}
          </div>

          <div className="rounded-xl bg-white p-6 ring-1 ring-gray-200/60 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">最近のアクティビティ</h2>
            <div className="mt-5 space-y-5">
              {recentStudents.length === 0 ? (
                <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">実データの活動履歴はまだありません。</p>
              ) : recentStudents.map((student, idx) => (
                <div key={student.id} className="flex gap-3">
                  <div className="relative flex flex-col items-center"><div className="flex size-2 rounded-full bg-indigo-500 ring-4 ring-indigo-50" />{idx < recentStudents.length - 1 && <div className="flex-1 w-px bg-gray-200 mt-1" />}</div>
                  <div className="pb-5"><p className="text-sm font-medium text-gray-900 leading-snug">{student.name} が更新されました</p><p className="mt-1 text-xs text-gray-500 leading-relaxed">{student.status} / {student.jobTitle ?? "希望職種未入力"}</p><p className="mt-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wide">{student.updatedAt?.slice(0, 10) ?? "日付未取得"}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-xl bg-white p-6 ring-1 ring-gray-200/60 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div><h2 className="text-sm font-semibold text-gray-900">候補者</h2><p className="mt-0.5 text-xs text-gray-500">LINE応募から保存された実データ</p></div>
              <button className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition">すべて見る<ArrowUpRight className="size-3.5" /></button>
            </div>
            <div className="space-y-3">
              {recentStudents.length === 0 ? <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">候補者データはまだありません。</p> : recentStudents.map((student) => (
                <div key={student.id} className="group flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/40 p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                  <div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">{student.name.charAt(0)}</div><div><p className="text-sm font-medium text-gray-900">{student.name}</p><p className="text-xs text-gray-500">{student.school} / {student.department}</p></div></div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">{student.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 ring-1 ring-gray-200/60 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">求人</h2>
            <div className="mt-5 flex items-center gap-3 rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500"><Briefcase className="size-4" />登録済み求人はまだありません。</div>
          </div>
        </section>
      </div>
    </>
  );
}
