import { Header } from "@/components/layout/header";
import {
  demoActivities,
  demoFunnelData,
  demoJobs,
  demoStudents,
} from "@/lib/demo-data";
import {
  ArrowUpRight,
  BarChart3,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Users,
  CalendarCheck,
  Award,
} from "lucide-react";

const statCards = [
  {
    label: "LINE流入数",
    value: 152,
    change: "+18%",
    changeLabel: "前週比",
    trend: "up" as const,
    icon: GraduationCap,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    label: "応募数",
    value: 96,
    change: "+8件",
    changeLabel: "今月",
    trend: "up" as const,
    icon: Users,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    label: "面接中",
    value: 53,
    change: "34+19件",
    changeLabel: "一次+最終",
    trend: "up" as const,
    icon: CalendarCheck,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    label: "内定数",
    value: 10,
    change: "6.6%",
    changeLabel: "歩留まり率",
    trend: "up" as const,
    icon: Award,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

export default function DashboardPage() {
  return (
    <>
      <Header title="ダッシュボード" />
      <div className="p-6 space-y-6">
        {/* Stats row */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-xl bg-white p-5 ring-1 ring-gray-200/60 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl ${stat.iconBg}`}
                  >
                    <Icon className={`size-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  {stat.trend === "up" && (
                    <TrendingUp className="size-3.5 text-emerald-500" />
                  )}
                  <span className="text-xs font-medium text-emerald-600">
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-400">
                    {stat.changeLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        {/* Chart placeholder + Activity */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Funnel chart */}
          <div className="xl:col-span-2 rounded-xl bg-white p-6 ring-1 ring-gray-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  採用ファネル（歩留まり）
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  LINE流入から入社までの歩留まり推移
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <BarChart3 className="size-3.5" />
                累計
              </div>
            </div>
            <div className="space-y-2.5">
              {demoFunnelData.map((item) => {
                const widthPercent = (item.count / 152) * 100;
                const yieldPercent = ((item.count / 152) * 100).toFixed(1);
                return (
                  <div key={item.stage} className="flex items-center gap-3">
                    <span className="w-[4.5rem] shrink-0 text-right text-xs font-medium text-gray-600">
                      {item.stage}
                    </span>
                    <div className="relative flex-1 h-7">
                      <div
                        className="absolute inset-y-0 left-0 rounded-md"
                        style={{
                          width: `${widthPercent}%`,
                          backgroundColor: item.color,
                          minWidth: "2rem",
                        }}
                      />
                      <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                        <span
                          className="ml-2 text-[11px] font-semibold text-white drop-shadow-sm"
                          style={{ marginLeft: Math.min(widthPercent, 90) > 15 ? "0.5rem" : undefined }}
                        >
                          {item.count}
                        </span>
                      </div>
                    </div>
                    <span className="w-12 shrink-0 text-right text-xs font-medium text-gray-500">
                      {yieldPercent}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity feed */}
          <div className="rounded-xl bg-white p-6 ring-1 ring-gray-200/60 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900">
              最近のアクティビティ
            </h2>
            <div className="mt-5 space-y-5">
              {demoActivities.map((activity, idx) => (
                <div key={activity.title} className="flex gap-3">
                  <div className="relative flex flex-col items-center">
                    <div className="flex size-2 rounded-full bg-indigo-500 ring-4 ring-indigo-50" />
                    {idx < demoActivities.length - 1 && (
                      <div className="flex-1 w-px bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="pb-5">
                    <p className="text-sm font-medium text-gray-900 leading-snug">
                      {activity.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                      {activity.description}
                    </p>
                    <p className="mt-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Candidates + Jobs */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Featured candidates */}
          <div className="xl:col-span-2 rounded-xl bg-white p-6 ring-1 ring-gray-200/60 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  注目候補者
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  AIマッチ度の高い候補者を優先表示
                </p>
              </div>
              <button className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition">
                すべて見る
                <ArrowUpRight className="size-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              {demoStudents.map((student) => {
                const scoreColor =
                  student.score >= 90
                    ? "text-emerald-700 bg-emerald-50 ring-emerald-200/60"
                    : student.score >= 80
                      ? "text-indigo-700 bg-indigo-50 ring-indigo-200/60"
                      : "text-amber-700 bg-amber-50 ring-amber-200/60";
                return (
                  <div
                    key={student.id}
                    className="group flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/40 p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {student.school} / {student.department}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                        {student.status}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ring-1 ${scoreColor}`}
                      >
                        {student.score}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Jobs overview */}
          <div className="space-y-4">
            {demoJobs.map((job) => {
              const scoreColor =
                job.score >= 90
                  ? "text-emerald-600"
                  : job.score >= 80
                    ? "text-indigo-600"
                    : "text-amber-600";
              return (
                <div
                  key={job.id}
                  className="rounded-xl bg-white p-5 ring-1 ring-gray-200/60 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-indigo-50">
                        <Briefcase className="size-4 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {job.title}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {job.location}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="text-xs text-gray-500">
                      応募{" "}
                      <span className="font-semibold text-gray-900">
                        {job.applicants}
                      </span>
                      件
                    </div>
                    <div className="text-xs text-gray-500">
                      平均マッチ度{" "}
                      <span className={`font-bold ${scoreColor}`}>
                        {job.score}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* CTA card */}
            <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 text-white shadow-lg shadow-indigo-500/20">
              <h3 className="text-sm font-semibold">公開企業ページ</h3>
              <p className="mt-1.5 text-xs text-indigo-200 leading-relaxed">
                学生向けの魅力発信ページから応募までつながる導線を確認
              </p>
              <button className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-white/25 transition">
                プレビューを見る
                <ArrowUpRight className="size-3.5" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
