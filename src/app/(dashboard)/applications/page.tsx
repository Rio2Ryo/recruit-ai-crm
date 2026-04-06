"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import {
  demoPipelineCandidates,
  pipelineStages,
  type PipelineCandidate,
  type PipelineStage,
} from "@/lib/demo-data";
import { ArrowRight, StickyNote, User } from "lucide-react";

const stageConfig: Record<
  PipelineStage,
  { bg: string; text: string; accent: string; dot: string; headerBg: string }
> = {
  "マッチング候補": {
    bg: "bg-gray-50",
    text: "text-gray-700",
    accent: "bg-gray-200 text-gray-700",
    dot: "bg-gray-400",
    headerBg: "bg-gray-100",
  },
  "見学参加": {
    bg: "bg-sky-50",
    text: "text-sky-700",
    accent: "bg-sky-100 text-sky-700",
    dot: "bg-sky-400",
    headerBg: "bg-sky-50",
  },
  "応募受付": {
    bg: "bg-violet-50",
    text: "text-violet-700",
    accent: "bg-violet-100 text-violet-700",
    dot: "bg-violet-400",
    headerBg: "bg-violet-50",
  },
  面接: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    accent: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
    headerBg: "bg-amber-50",
  },
  内定: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    accent: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-400",
    headerBg: "bg-emerald-50",
  },
};

function CandidateCard({
  candidate,
  onMove,
}: {
  candidate: PipelineCandidate;
  onMove: (id: string, direction: "forward" | "backward") => void;
}) {
  const stageIdx = pipelineStages.indexOf(candidate.stage);
  const canMoveForward = stageIdx < pipelineStages.length - 1;
  const canMoveBackward = stageIdx > 0;

  const scoreBg =
    candidate.score >= 90
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200/60"
      : candidate.score >= 80
        ? "bg-indigo-50 text-indigo-700 ring-indigo-200/60"
        : candidate.score >= 70
          ? "bg-amber-50 text-amber-700 ring-amber-200/60"
          : "bg-gray-50 text-gray-600 ring-gray-200/60";

  return (
    <div className="rounded-lg bg-white ring-1 ring-gray-200/80 shadow-sm hover:shadow-md transition-all group">
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 truncate">
              {candidate.name}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {candidate.school}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold ring-1 ${scoreBg}`}
          >
            {candidate.score}%
          </span>
        </div>

        <p className="mt-1.5 inline-flex rounded bg-indigo-50/80 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600">
          {candidate.jobTitle}
        </p>

        {candidate.note && (
          <div className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-50/80 p-2 ring-1 ring-amber-200/40">
            <StickyNote className="size-3 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              {candidate.note}
            </p>
          </div>
        )}

        {/* Move buttons */}
        <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 pt-2">
          <span className="text-[10px] text-gray-400 tabular-nums">
            {candidate.updatedAt}
          </span>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {canMoveBackward && (
              <button
                onClick={() => onMove(candidate.id, "backward")}
                className="rounded px-2 py-0.5 text-[11px] text-gray-500 hover:bg-gray-100 transition"
                title={`${pipelineStages[stageIdx - 1]}に戻す`}
              >
                &#8592; 戻す
              </button>
            )}
            {canMoveForward && (
              <button
                onClick={() => onMove(candidate.id, "forward")}
                className="rounded px-2 py-0.5 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 transition"
                title={`${pipelineStages[stageIdx + 1]}に進める`}
              >
                進める &#8594;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  const [candidates, setCandidates] = useState(demoPipelineCandidates);

  function handleMove(id: string, direction: "forward" | "backward") {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const idx = pipelineStages.indexOf(c.stage);
        const newIdx = direction === "forward" ? idx + 1 : idx - 1;
        if (newIdx < 0 || newIdx >= pipelineStages.length) return c;
        return { ...c, stage: pipelineStages[newIdx], updatedAt: "2026-04-05" };
      })
    );
  }

  const stageGroups = pipelineStages.map((stage) => ({
    stage,
    items: candidates.filter((c) => c.stage === stage),
  }));

  const total = candidates.length;

  return (
    <>
      <Header title="選考パイプライン" />
      <div className="p-6">
        {/* Funnel summary */}
        <div className="mb-6 rounded-xl bg-white p-5 ring-1 ring-gray-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">
              選考ファネル
            </h2>
            <span className="text-xs text-gray-500">
              全{total}名
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {stageGroups.map((group, i) => {
              const config = stageConfig[group.stage];
              return (
                <div key={group.stage} className="flex items-center gap-2">
                  <div
                    className={`rounded-xl ${config.headerBg} px-5 py-3 text-center min-w-[110px] ring-1 ring-black/[0.04]`}
                  >
                    <p className={`text-2xl font-bold ${config.text}`}>
                      {group.items.length}
                    </p>
                    <p className="text-[11px] text-gray-600 mt-0.5 font-medium">
                      {group.stage}
                    </p>
                  </div>
                  {i < stageGroups.length - 1 && (
                    <ArrowRight className="size-4 text-gray-300 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Kanban board */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-h-[500px]">
          {stageGroups.map((group) => {
            const config = stageConfig[group.stage];
            return (
              <div key={group.stage} className="flex flex-col">
                {/* Column header */}
                <div className="rounded-lg bg-white ring-1 ring-gray-200/60 px-3 py-2.5 mb-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`size-2 rounded-full ${config.dot}`}
                      />
                      <h3 className="text-xs font-semibold text-gray-800">
                        {group.stage}
                      </h3>
                    </div>
                    <span
                      className={`flex items-center justify-center size-5 rounded-full text-[10px] font-bold ${config.accent}`}
                    >
                      {group.items.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-2.5">
                  {group.items.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
                      <User className="size-5 mx-auto text-gray-300" />
                      <p className="mt-1.5 text-[11px] text-gray-400">
                        候補者なし
                      </p>
                    </div>
                  )}
                  {group.items.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
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
