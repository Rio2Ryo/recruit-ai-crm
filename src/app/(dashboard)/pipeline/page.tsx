"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import {
  demoFunnelCandidates,
  funnelStages,
  type FunnelStage,
  type FunnelCandidate,
} from "@/lib/demo-data";
import {
  ArrowDown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageSquare,
  Plus,
  Send,
  Smartphone,
  User,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Color config                                                        */
/* ------------------------------------------------------------------ */
const stageColors: Record<
  FunnelStage,
  { dot: string; headerBg: string; text: string; accent: string; border: string; barBg: string }
> = {
  LINE流入: { dot: "bg-indigo-400", headerBg: "bg-indigo-50", text: "text-indigo-700", accent: "bg-indigo-100 text-indigo-700", border: "border-indigo-200", barBg: "bg-indigo-500" },
  応募: { dot: "bg-violet-400", headerBg: "bg-violet-50", text: "text-violet-700", accent: "bg-violet-100 text-violet-700", border: "border-violet-200", barBg: "bg-violet-500" },
  書類選考: { dot: "bg-purple-400", headerBg: "bg-purple-50", text: "text-purple-700", accent: "bg-purple-100 text-purple-700", border: "border-purple-200", barBg: "bg-purple-500" },
  一次面接: { dot: "bg-fuchsia-400", headerBg: "bg-fuchsia-50", text: "text-fuchsia-700", accent: "bg-fuchsia-100 text-fuchsia-700", border: "border-fuchsia-200", barBg: "bg-fuchsia-500" },
  最終面接: { dot: "bg-pink-400", headerBg: "bg-pink-50", text: "text-pink-700", accent: "bg-pink-100 text-pink-700", border: "border-pink-200", barBg: "bg-pink-500" },
  内定: { dot: "bg-rose-400", headerBg: "bg-rose-50", text: "text-rose-700", accent: "bg-rose-100 text-rose-700", border: "border-rose-200", barBg: "bg-rose-500" },
  入社: { dot: "bg-emerald-400", headerBg: "bg-emerald-50", text: "text-emerald-700", accent: "bg-emerald-100 text-emerald-700", border: "border-emerald-200", barBg: "bg-emerald-500" },
};

const sourceBadge: Record<string, string> = {
  LINE: "bg-green-50 text-green-700 ring-green-600/20",
  Web: "bg-blue-50 text-blue-700 ring-blue-600/20",
  紹介: "bg-purple-50 text-purple-700 ring-purple-600/20",
  学校: "bg-orange-50 text-orange-700 ring-orange-600/20",
};

/* ------------------------------------------------------------------ */
/* Candidate Card                                                      */
/* ------------------------------------------------------------------ */
function CandidateCard({
  candidate,
  stageIdx,
  totalStages,
  onMove,
}: {
  candidate: FunnelCandidate;
  stageIdx: number;
  totalStages: number;
  onMove: (id: string, direction: "forward" | "backward") => void;
}) {
  return (
    <div className="rounded-xl bg-white ring-1 ring-gray-200/80 shadow-sm hover:shadow-md transition-all group">
      <div className="p-3.5">
        {/* Name + Source */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-xs font-bold text-gray-600 shrink-0">
              {candidate.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {candidate.name}
              </p>
              <p className="text-xs text-gray-500">{candidate.position}</p>
            </div>
          </div>
          <span
            className={`shrink-0 inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ${sourceBadge[candidate.source]}`}
          >
            {candidate.source}
          </span>
        </div>

        {/* Note */}
        {candidate.note && (
          <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-amber-50/80 p-2.5 ring-1 ring-amber-200/40">
            <MessageSquare className="size-3 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              {candidate.note}
            </p>
          </div>
        )}

        {/* Date + Actions */}
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5">
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <Clock className="size-3" />
            <span className="tabular-nums">{candidate.lastUpdated}</span>
          </div>
          <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            {stageIdx > 0 && (
              <button
                onClick={() => onMove(candidate.id, "backward")}
                className="rounded-lg px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition flex items-center gap-0.5"
                title="前のステージに戻す"
              >
                <ChevronLeft className="size-3" />
                <span className="hidden sm:inline">戻す</span>
              </button>
            )}
            {stageIdx < totalStages - 1 && (
              <button
                onClick={() => onMove(candidate.id, "forward")}
                className="rounded-lg px-2 py-1 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition flex items-center gap-0.5"
                title="次のステージに進める"
              >
                <span className="hidden sm:inline">進める</span>
                <ChevronRight className="size-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                           */
/* ------------------------------------------------------------------ */
export default function PipelinePage() {
  const [candidates, setCandidates] = useState(demoFunnelCandidates);
  const [mobileStage, setMobileStage] = useState<FunnelStage>("LINE流入");

  useEffect(() => {
    fetch("/api/line/applicants", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const json = await response.json();
        const lineCandidates = (json.funnelCandidates ?? []) as FunnelCandidate[];
        setCandidates([...lineCandidates, ...demoFunnelCandidates]);
      })
      .catch(() => setCandidates(demoFunnelCandidates));
  }, []);

  function handleMove(id: string, direction: "forward" | "backward") {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const idx = funnelStages.indexOf(c.currentStage);
        const newIdx = direction === "forward" ? idx + 1 : idx - 1;
        if (newIdx < 0 || newIdx >= funnelStages.length) return c;
        return { ...c, currentStage: funnelStages[newIdx], lastUpdated: "2026-04-17" };
      })
    );
  }

  const stageGroups = funnelStages.map((stage) => ({
    stage,
    items: candidates.filter((c) => c.currentStage === stage),
  }));

  const funnelCountByStage = Object.fromEntries(
    stageGroups.map((group) => [group.stage, group.items.length])
  ) as Record<FunnelStage, number>;
  const total = candidates.length;
  const overallRate = total ? ((stageGroups[stageGroups.length - 1].items.length / total) * 100).toFixed(1) : "0.0";

  return (
    <>
      <Header title="歩留まり管理" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">


        {/* ============================================================ */}
        {/* LINE Official Account control panel                          */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200/60 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#06c755]/10 text-[#06c755]">
                <Smartphone className="size-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">公式LINE応募導線</h2>
                <p className="text-xs text-gray-500">公式LINE → LINE内応募 → 管理画面で歩留まり管理</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
              {["求人", "応募", "見学", "相談"].map((label) => (
                <div key={label} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center">
                  <p className="text-[11px] font-semibold text-gray-500">Rich Menu</p>
                  <p className="mt-1 text-sm font-bold text-gray-900">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-xs leading-6 text-green-800 ring-1 ring-green-200/70">
              LINE連携: <code>/api/line/webhook</code> / CLI送信: <code>npm run line:send</code>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200/60 shadow-sm">
            <div className="flex items-center gap-2">
              <Send className="size-4 text-indigo-500" />
              <h2 className="text-sm font-semibold text-gray-900">連絡テンプレート</h2>
            </div>
            <div className="mt-4 space-y-2 text-xs text-gray-600">
              {[
                "応募受付: 応募ありがとうございます。担当者が確認してLINEでご連絡します。",
                "見学案内: 会社見学の候補日を3つお送りします。",
                "面接調整: 一次面接の日程をご確認ください。",
              ].map((text) => (
                <div key={text} className="rounded-lg border border-gray-200 px-3 py-2">{text}</div>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Process Flow — Desktop: horizontal, Mobile: vertical          */}
        {/* ============================================================ */}
        <div className="rounded-xl bg-white p-4 sm:p-6 ring-1 ring-gray-200/60 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-5 gap-2">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">プロセスフロー</h2>
              <p className="text-xs text-gray-500 mt-0.5">候補者の選考プロセスを管理</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200/60">
                全体通過率 {overallRate}%
              </span>
              <span className="text-xs text-gray-400">全{total}名</span>
            </div>
          </div>

          {/* Desktop flow (horizontal) */}
          <div className="hidden lg:flex items-stretch gap-0 overflow-x-auto pb-2">
            {stageGroups.map((group, i) => {
              const colors = stageColors[group.stage];
              const prevCount = i > 0 ? stageGroups[i - 1]?.items.length : null;
              const currentFunnelCount = group.items.length;
              const rate = prevCount ? ((currentFunnelCount / prevCount) * 100).toFixed(0) : null;

              return (
                <div key={group.stage} className="flex items-center">
                  <div className={`relative rounded-xl ${colors.headerBg} border ${colors.border} px-5 py-4 min-w-[130px] flex flex-col items-center justify-center hover:shadow-md transition-shadow`}>
                    <div className={`size-3 rounded-full ${colors.dot} mb-2`} />
                    <p className="text-xs font-semibold text-gray-700 text-center whitespace-nowrap">{group.stage}</p>
                    <p className={`text-3xl font-bold ${colors.text} mt-1 tabular-nums`}>{funnelCountByStage[group.stage]}</p>
                    {rate && (
                      <div className="mt-1.5 rounded-full bg-white/80 px-2 py-0.5">
                        <p className="text-[10px] font-medium text-gray-500">通過率 <span className="font-bold text-gray-700">{rate}%</span></p>
                      </div>
                    )}
                  </div>
                  {i < stageGroups.length - 1 && (
                    <div className="flex items-center px-2">
                      <ArrowRight className="size-5 text-gray-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tablet flow (compact horizontal) */}
          <div className="hidden md:flex lg:hidden items-center gap-1 overflow-x-auto pb-2">
            {stageGroups.map((group, i) => {
              const colors = stageColors[group.stage];
              const prevCount = i > 0 ? stageGroups[i - 1]?.items.length : null;
              const currentFunnelCount = group.items.length;
              const rate = prevCount ? ((currentFunnelCount / prevCount) * 100).toFixed(0) : null;
              return (
                <div key={group.stage} className="flex items-center">
                  <div className={`rounded-lg ${colors.headerBg} border ${colors.border} px-3 py-2.5 text-center min-w-[90px]`}>
                    <p className="text-[10px] font-semibold text-gray-600">{group.stage}</p>
                    <p className={`text-xl font-bold ${colors.text} mt-0.5`}>{funnelCountByStage[group.stage]}</p>
                    {rate && <p className="text-[9px] text-gray-400">{rate}%</p>}
                  </div>
                  {i < stageGroups.length - 1 && <ArrowRight className="size-3.5 text-gray-300 mx-0.5 shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Mobile flow (vertical) */}
          <div className="md:hidden space-y-2">
            {stageGroups.map((group, i) => {
              const colors = stageColors[group.stage];
              const prevCount = i > 0 ? stageGroups[i - 1]?.items.length : null;
              const currentFunnelCount = group.items.length;
              const rate = prevCount ? ((currentFunnelCount / prevCount) * 100).toFixed(0) : null;
              const barWidth = total ? (currentFunnelCount / total) * 100 : 0;

              return (
                <div key={group.stage}>
                  <button
                    onClick={() => setMobileStage(group.stage)}
                    className={`w-full rounded-lg border p-3 flex items-center gap-3 transition-all ${
                      mobileStage === group.stage
                        ? `${colors.headerBg} ${colors.border} ring-2 ring-offset-1`
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`size-2.5 rounded-full ${colors.dot} shrink-0`} />
                    <span className="text-xs font-semibold text-gray-700 w-16 text-left">{group.stage}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${colors.barBg} rounded-full transition-all duration-500`} style={{ width: `${barWidth}%` }} />
                    </div>
                    <span className={`text-lg font-bold tabular-nums ${colors.text} w-10 text-right`}>{funnelCountByStage[group.stage]}</span>
                    {rate && <span className="text-[10px] text-gray-400 w-10 text-right">{rate}%</span>}
                  </button>
                  {i < stageGroups.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <ArrowDown className="size-3.5 text-gray-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add button */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700 transition shadow-sm">
              <Plus className="size-3.5" />
              候補者を追加
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Kanban Board — Desktop: 7-col grid, Mobile: single column    */}
        {/* ============================================================ */}

        {/* Mobile: Stage selector + single column */}
        <div className="lg:hidden">
          <div className="rounded-xl bg-white ring-1 ring-gray-200/60 shadow-sm overflow-hidden">
            {/* Stage tabs (scrollable) */}
            <div className="border-b border-gray-100 overflow-x-auto">
              <div className="flex -mb-px">
                {funnelStages.map((stage) => {
                  const colors = stageColors[stage];
                  const count = funnelCountByStage[stage];
                  const isActive = mobileStage === stage;
                  return (
                    <button
                      key={stage}
                      onClick={() => setMobileStage(stage)}
                      className={`px-3 sm:px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                        isActive
                          ? `${colors.text} border-current`
                          : "text-gray-500 border-transparent hover:text-gray-700"
                      }`}
                    >
                      <div className={`size-1.5 rounded-full ${colors.dot}`} />
                      {stage}
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? colors.accent : "bg-gray-100 text-gray-500"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cards for selected stage */}
            <div className="p-4 space-y-3">
              {(() => {
                const stageIdx = funnelStages.indexOf(mobileStage);
                const items = candidates.filter((c) => c.currentStage === mobileStage);
                if (items.length === 0) {
                  return (
                    <div className="py-12 text-center">
                      <User className="size-8 mx-auto text-gray-300" />
                      <p className="mt-2 text-sm text-gray-400">このステージの候補者はいません</p>
                    </div>
                  );
                }
                return items.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    stageIdx={stageIdx}
                    totalStages={funnelStages.length}
                    onMove={handleMove}
                  />
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Desktop: Full 7-column kanban (horizontally scrollable) */}
        <div className="hidden lg:flex gap-4 min-h-[500px] overflow-x-auto pb-4">
          {stageGroups.map((group, i) => {
            const colors = stageColors[group.stage];
            return (
              <div key={group.stage} className="flex flex-col min-w-[200px] w-[200px] shrink-0">
                {/* Column Header */}
                <div className={`rounded-xl ${colors.headerBg} border ${colors.border} px-3 py-3 mb-3 shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`size-2.5 rounded-full ${colors.dot}`} />
                      <h3 className="text-[11px] font-bold text-gray-800 truncate">
                        {group.stage}
                      </h3>
                    </div>
                    <span className={`flex items-center justify-center size-6 rounded-full text-[11px] font-bold ${colors.accent}`}>
                      {funnelCountByStage[group.stage]}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-2.5">
                  {group.items.length === 0 && (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
                      <User className="size-5 mx-auto text-gray-300" />
                      <p className="mt-1.5 text-[11px] text-gray-400">候補者なし</p>
                    </div>
                  )}
                  {group.items.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      stageIdx={i}
                      totalStages={funnelStages.length}
                      onMove={handleMove}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
