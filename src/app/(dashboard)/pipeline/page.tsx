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
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// Stage colors for the funnel visualization
const stageColors: Record<FunnelStage, { bg: string; text: string; bar: string; light: string }> = {
  LINE流入: { bg: "bg-indigo-50", text: "text-indigo-700", bar: "bg-indigo-500", light: "bg-indigo-100" },
  応募: { bg: "bg-violet-50", text: "text-violet-700", bar: "bg-violet-500", light: "bg-violet-100" },
  書類選考: { bg: "bg-purple-50", text: "text-purple-700", bar: "bg-purple-500", light: "bg-purple-100" },
  一次面接: { bg: "bg-fuchsia-50", text: "text-fuchsia-700", bar: "bg-fuchsia-500", light: "bg-fuchsia-100" },
  最終面接: { bg: "bg-pink-50", text: "text-pink-700", bar: "bg-pink-500", light: "bg-pink-100" },
  内定: { bg: "bg-rose-50", text: "text-rose-700", bar: "bg-rose-500", light: "bg-rose-100" },
  入社: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500", light: "bg-emerald-100" },
};

// Source badge colors
const sourceBadge: Record<string, string> = {
  LINE: "bg-green-50 text-green-700 ring-green-200/60",
  Web: "bg-blue-50 text-blue-700 ring-blue-200/60",
  紹介: "bg-purple-50 text-purple-700 ring-purple-200/60",
  学校: "bg-orange-50 text-orange-700 ring-orange-200/60",
};

// Previous month comparison data (mock)
const prevMonthDelta: Record<FunnelStage, number> = {
  LINE流入: 5.2,
  応募: -2.1,
  書類選考: 3.8,
  一次面接: -1.5,
  最終面接: 2.3,
  内定: 0.0,
  入社: 4.0,
};

function getConversionRate(current: number, previous: number): string {
  return ((current / previous) * 100).toFixed(1);
}

function getCumulativeRate(count: number, total: number): string {
  return ((count / total) * 100).toFixed(1);
}

export default function PipelinePage() {
  const [selectedStage, setSelectedStage] = useState<FunnelStage>("LINE流入");
  const [candidates, setCandidates] = useState(demoFunnelCandidates);

  const maxCount = demoFunnelData[0].count;
  const overallRate = getConversionRate(
    demoFunnelData[demoFunnelData.length - 1].count,
    demoFunnelData[0].count
  );

  const filteredCandidates = candidates.filter(
    (c) => c.currentStage === selectedStage
  );

  function handleAdvance(id: string) {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const idx = funnelStages.indexOf(c.currentStage);
        if (idx >= funnelStages.length - 1) return c;
        return {
          ...c,
          currentStage: funnelStages[idx + 1],
          lastUpdated: "2026-04-13",
        };
      })
    );
  }

  function handleReject(id: string) {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <>
      <Header title="歩留まり管理" />
      <div className="p-6 space-y-6">
        {/* Funnel Overview Cards */}
        <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              選考ファネル概要
            </h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200/60">
                <TrendingUp className="size-3" />
                LINE流入→入社: {overallRate}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {demoFunnelData.map((item, i) => {
              const colors = stageColors[item.stage];
              const prevCount = i > 0 ? demoFunnelData[i - 1].count : null;
              const rate = prevCount
                ? getConversionRate(item.count, prevCount)
                : null;

              return (
                <div key={item.stage} className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedStage(item.stage)}
                    className={`rounded-xl px-4 py-3 text-center min-w-[100px] ring-1 ring-black/[0.04] transition-all hover:shadow-md ${
                      selectedStage === item.stage
                        ? `${colors.light} ring-2 ring-offset-1 ring-current`
                        : colors.bg
                    }`}
                  >
                    <p className={`text-xl font-bold ${colors.text}`}>
                      {item.count}
                    </p>
                    <p className="text-[11px] text-gray-600 mt-0.5 font-medium">
                      {item.stage}
                    </p>
                    {rate && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {rate}%
                      </p>
                    )}
                  </button>
                  {i < demoFunnelData.length - 1 && (
                    <ChevronRight className="size-4 text-gray-300 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Funnel Chart */}
        <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200/60 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            ファネルチャート
          </h2>
          <div className="space-y-2.5">
            {demoFunnelData.map((item) => {
              const widthPct = (item.count / maxCount) * 100;
              const colors = stageColors[item.stage];
              return (
                <div key={item.stage} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 font-medium w-20 text-right shrink-0">
                    {item.stage}
                  </span>
                  <div className="flex-1 h-8 bg-gray-50 rounded-lg overflow-hidden relative">
                    <div
                      className={`h-full ${colors.bar} rounded-lg transition-all duration-500 flex items-center`}
                      style={{ width: `${widthPct}%` }}
                    >
                      <span className="absolute left-3 text-xs font-semibold text-white drop-shadow-sm">
                        {item.count}人
                      </span>
                    </div>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 tabular-nums">
                      {((item.count / maxCount) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage-by-Stage Conversion Table */}
        <div className="rounded-xl bg-white ring-1 ring-gray-200/60 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              ステージ別通過率
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ステージ
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    人数
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    通過率
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    累計通過率
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    前月比
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {demoFunnelData.map((item, i) => {
                  const prevCount =
                    i > 0 ? demoFunnelData[i - 1].count : null;
                  const rate = prevCount
                    ? getConversionRate(item.count, prevCount)
                    : "---";
                  const cumRate = getCumulativeRate(
                    item.count,
                    demoFunnelData[0].count
                  );
                  const delta = prevMonthDelta[item.stage];
                  const colors = stageColors[item.stage];

                  return (
                    <tr
                      key={item.stage}
                      className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"} hover:bg-gray-50 transition-colors`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-2.5 rounded-full ${colors.bar}`}
                          />
                          <span className="font-medium text-gray-900">
                            {item.stage}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-700 font-medium">
                        {item.count}人
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-700">
                        {rate === "---" ? (
                          <span className="text-gray-400">{rate}</span>
                        ) : (
                          <span>{rate}%</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-700">
                        {i === 0 ? (
                          <span className="text-gray-400">100.0%</span>
                        ) : (
                          <span>{cumRate}%</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {delta > 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 text-xs font-medium">
                            <TrendingUp className="size-3" />+{delta}%
                          </span>
                        ) : delta < 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-red-500 text-xs font-medium">
                            <TrendingDown className="size-3" />
                            {delta}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">---</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Candidate List by Stage */}
        <div className="rounded-xl bg-white ring-1 ring-gray-200/60 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                候補者一覧
              </h2>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Users className="size-3.5" />
                <span>{filteredCandidates.length}名</span>
              </div>
            </div>
          </div>

          {/* Stage Tabs */}
          <div className="border-b border-gray-100 px-5">
            <div className="flex gap-0.5 overflow-x-auto -mb-px">
              {funnelStages.map((stage) => {
                const isActive = selectedStage === stage;
                const colors = stageColors[stage];
                const count = candidates.filter(
                  (c) => c.currentStage === stage
                ).length;
                return (
                  <button
                    key={stage}
                    onClick={() => setSelectedStage(stage)}
                    className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? `${colors.text} border-current`
                        : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {stage}
                    <span
                      className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive ? colors.light : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Candidate Table */}
          <div className="overflow-x-auto">
            {filteredCandidates.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="size-8 mx-auto text-gray-300" />
                <p className="mt-2 text-sm text-gray-400">
                  このステージの候補者はいません
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                      名前
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                      流入元
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                      応募職種
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                      応募日
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                      最終更新
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">
                      メモ
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCandidates.map((candidate, i) => {
                    const stageIdx = funnelStages.indexOf(
                      candidate.currentStage
                    );
                    const canAdvance = stageIdx < funnelStages.length - 1;

                    return (
                      <tr
                        key={candidate.id}
                        className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"} hover:bg-gray-50 transition-colors`}
                      >
                        <td className="px-5 py-3">
                          <span className="font-medium text-gray-900">
                            {candidate.name}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ${sourceBadge[candidate.source]}`}
                          >
                            {candidate.source}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-700">
                          {candidate.position}
                        </td>
                        <td className="px-5 py-3 text-gray-500 tabular-nums text-xs">
                          {candidate.appliedAt}
                        </td>
                        <td className="px-5 py-3 text-gray-500 tabular-nums text-xs">
                          {candidate.lastUpdated}
                        </td>
                        <td className="px-5 py-3">
                          {candidate.note ? (
                            <span className="text-xs text-gray-600 bg-amber-50 rounded px-1.5 py-0.5">
                              {candidate.note}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">---</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {canAdvance && (
                              <button
                                onClick={() => handleAdvance(candidate.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-[11px] font-medium text-indigo-700 hover:bg-indigo-100 transition-colors ring-1 ring-indigo-200/60"
                              >
                                <CheckCircle2 className="size-3" />
                                次へ進める
                              </button>
                            )}
                            <button
                              onClick={() => handleReject(candidate.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-100 transition-colors ring-1 ring-red-200/60"
                            >
                              <XCircle className="size-3" />
                              不採用
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
