"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import {
  demoFunnelData,
  demoFunnelCandidates,
  funnelStages,
  type FunnelStage,
  type FunnelCandidate,
} from "@/lib/demo-data";
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Clock,
  MessageSquare,
  MoreHorizontal,
  Plus,
  User,
  Users,
} from "lucide-react";

const stageColors: Record<
  FunnelStage,
  { dot: string; bg: string; headerBg: string; text: string; accent: string; border: string }
> = {
  LINE流入: { dot: "bg-indigo-400", bg: "bg-indigo-50/50", headerBg: "bg-indigo-50", text: "text-indigo-700", accent: "bg-indigo-100 text-indigo-700", border: "border-indigo-200" },
  応募: { dot: "bg-violet-400", bg: "bg-violet-50/50", headerBg: "bg-violet-50", text: "text-violet-700", accent: "bg-violet-100 text-violet-700", border: "border-violet-200" },
  書類選考: { dot: "bg-purple-400", bg: "bg-purple-50/50", headerBg: "bg-purple-50", text: "text-purple-700", accent: "bg-purple-100 text-purple-700", border: "border-purple-200" },
  一次面接: { dot: "bg-fuchsia-400", bg: "bg-fuchsia-50/50", headerBg: "bg-fuchsia-50", text: "text-fuchsia-700", accent: "bg-fuchsia-100 text-fuchsia-700", border: "border-fuchsia-200" },
  最終面接: { dot: "bg-pink-400", bg: "bg-pink-50/50", headerBg: "bg-pink-50", text: "text-pink-700", accent: "bg-pink-100 text-pink-700", border: "border-pink-200" },
  内定: { dot: "bg-rose-400", bg: "bg-rose-50/50", headerBg: "bg-rose-50", text: "text-rose-700", accent: "bg-rose-100 text-rose-700", border: "border-rose-200" },
  入社: { dot: "bg-emerald-400", bg: "bg-emerald-50/50", headerBg: "bg-emerald-50", text: "text-emerald-700", accent: "bg-emerald-100 text-emerald-700", border: "border-emerald-200" },
};

const sourceBadge: Record<string, string> = {
  LINE: "bg-green-50 text-green-700 ring-green-600/20",
  Web: "bg-blue-50 text-blue-700 ring-blue-600/20",
  紹介: "bg-purple-50 text-purple-700 ring-purple-600/20",
  学校: "bg-orange-50 text-orange-700 ring-orange-600/20",
};

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
    <div className="rounded-lg bg-white ring-1 ring-gray-200/80 shadow-sm hover:shadow-md transition-all group">
      <div className="p-3">
        {/* Name + Source */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 shrink-0">
              {candidate.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 truncate">
                {candidate.name}
              </p>
              <p className="text-[11px] text-gray-500">{candidate.position}</p>
            </div>
          </div>
          <span
            className={`shrink-0 inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${sourceBadge[candidate.source]}`}
          >
            {candidate.source}
          </span>
        </div>

        {/* Note */}
        {candidate.note && (
          <div className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-50/80 p-2 ring-1 ring-amber-200/40">
            <MessageSquare className="size-3 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              {candidate.note}
            </p>
          </div>
        )}

        {/* Date + Actions */}
        <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 pt-2">
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <Clock className="size-3" />
            <span className="tabular-nums">{candidate.lastUpdated}</span>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {stageIdx > 0 && (
              <button
                onClick={() => onMove(candidate.id, "backward")}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                title="前のステージに戻す"
              >
                <ChevronLeft className="size-3.5" />
              </button>
            )}
            {stageIdx < totalStages - 1 && (
              <button
                onClick={() => onMove(candidate.id, "forward")}
                className="rounded p-1 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition"
                title="次のステージに進める"
              >
                <ChevronRight className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [candidates, setCandidates] = useState(demoFunnelCandidates);

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

  const total = candidates.length;

  return (
    <>
      <Header title="歩留まり管理" />
      <div className="p-6 space-y-6">
        {/* Process Flow Overview */}
        <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">プロセスフロー</h2>
              <p className="text-xs text-gray-500 mt-0.5">候補者の選考プロセス全体を管理</p>
            </div>
            <span className="text-xs text-gray-500">全{total}名</span>
          </div>

          {/* Flow Diagram */}
          <div className="flex items-stretch gap-0 overflow-x-auto pb-2">
            {stageGroups.map((group, i) => {
              const colors = stageColors[group.stage];
              const prevCount = i > 0 ? demoFunnelData[i - 1]?.count : null;
              const currentFunnelCount = demoFunnelData[i]?.count ?? 0;
              const rate = prevCount ? ((currentFunnelCount / prevCount) * 100).toFixed(0) : null;

              return (
                <div key={group.stage} className="flex items-stretch">
                  {/* Stage Block */}
                  <div className={`relative rounded-xl ${colors.headerBg} border ${colors.border} px-4 py-3 min-w-[120px] flex flex-col items-center justify-center`}>
                    <div className={`size-2.5 rounded-full ${colors.dot} mb-1.5`} />
                    <p className="text-[11px] font-semibold text-gray-700 text-center">{group.stage}</p>
                    <p className={`text-2xl font-bold ${colors.text} mt-1`}>{group.items.length}</p>
                    {rate && (
                      <p className="text-[10px] text-gray-400 mt-0.5">通過率 {rate}%</p>
                    )}
                  </div>

                  {/* Arrow */}
                  {i < stageGroups.length - 1 && (
                    <div className="flex items-center px-1.5">
                      <div className="flex flex-col items-center">
                        <ArrowRight className="size-5 text-gray-300" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Overall conversion */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>LINE流入 → 入社 全体通過率:</span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200/60">
                {((demoFunnelData[demoFunnelData.length - 1].count / demoFunnelData[0].count) * 100).toFixed(1)}%
              </span>
            </div>
            <button className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition">
              <Plus className="size-3.5" />
              候補者を追加
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-7 gap-3 min-h-[500px]">
          {stageGroups.map((group, i) => {
            const colors = stageColors[group.stage];
            return (
              <div key={group.stage} className="flex flex-col min-w-0">
                {/* Column Header */}
                <div className={`rounded-lg ${colors.headerBg} border ${colors.border} px-3 py-2.5 mb-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`size-2 rounded-full ${colors.dot}`} />
                      <h3 className="text-[11px] font-semibold text-gray-800 truncate">
                        {group.stage}
                      </h3>
                    </div>
                    <span className={`flex items-center justify-center size-5 rounded-full text-[10px] font-bold ${colors.accent}`}>
                      {group.items.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-2">
                  {group.items.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center">
                      <User className="size-4 mx-auto text-gray-300" />
                      <p className="mt-1 text-[10px] text-gray-400">なし</p>
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
