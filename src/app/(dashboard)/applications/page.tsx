"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import {
  demoPipelineCandidates,
  pipelineStages,
  type PipelineCandidate,
  type PipelineStage,
} from "@/lib/demo-data";
import { ArrowRight, GripVertical, StickyNote, User } from "lucide-react";

const stageColors: Record<PipelineStage, { bg: string; text: string; accent: string; ring: string }> = {
  "マッチング候補": { bg: "bg-gray-50", text: "text-gray-700", accent: "bg-gray-200", ring: "ring-gray-200" },
  "見学参加": { bg: "bg-sky-50", text: "text-sky-700", accent: "bg-sky-200", ring: "ring-sky-200" },
  "応募受付": { bg: "bg-violet-50", text: "text-violet-700", accent: "bg-violet-200", ring: "ring-violet-200" },
  "面接": { bg: "bg-amber-50", text: "text-amber-700", accent: "bg-amber-200", ring: "ring-amber-200" },
  "内定": { bg: "bg-emerald-50", text: "text-emerald-700", accent: "bg-emerald-200", ring: "ring-emerald-200" },
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
      ? "bg-emerald-100 text-emerald-700"
      : candidate.score >= 80
        ? "bg-indigo-100 text-indigo-700"
        : candidate.score >= 70
          ? "bg-amber-100 text-amber-700"
          : "bg-gray-100 text-gray-600";

  return (
    <div className="rounded-xl bg-white ring-1 ring-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3.5">
        <div className="flex items-start gap-2">
          <GripVertical className="size-4 text-gray-300 mt-0.5 shrink-0 cursor-grab" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {candidate.name}
              </p>
              <span
                className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold ${scoreBg}`}
              >
                {candidate.score}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{candidate.school}</p>
            <p className="text-xs text-indigo-600 mt-0.5">
              {candidate.jobTitle}
            </p>
            {candidate.note && (
              <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 p-2">
                <StickyNote className="size-3 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  {candidate.note}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Move buttons */}
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5">
          <span className="text-[10px] text-gray-400">{candidate.updatedAt}</span>
          <div className="flex items-center gap-1">
            {canMoveBackward && (
              <button
                onClick={() => onMove(candidate.id, "backward")}
                className="rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 transition"
                title={`${pipelineStages[stageIdx - 1]}に戻す`}
              >
                ← 戻す
              </button>
            )}
            {canMoveForward && (
              <button
                onClick={() => onMove(candidate.id, "forward")}
                className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition"
                title={`${pipelineStages[stageIdx + 1]}に進める`}
              >
                進める →
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

  return (
    <>
      <Header title="選考パイプライン" />
      <div className="p-6">
        {/* Funnel summary */}
        <Card className="mb-6 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            選考ファネル
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {stageGroups.map((group, i) => {
              const colors = stageColors[group.stage];
              return (
                <div key={group.stage} className="flex items-center gap-2">
                  <div
                    className={`rounded-xl ${colors.bg} px-4 py-3 text-center min-w-[120px]`}
                  >
                    <p className={`text-2xl font-bold ${colors.text}`}>
                      {group.items.length}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
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
        </Card>

        {/* Kanban board */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 min-h-[500px]">
          {stageGroups.map((group) => {
            const colors = stageColors[group.stage];
            return (
              <div key={group.stage} className="flex flex-col">
                {/* Column header */}
                <div
                  className={`rounded-xl ${colors.bg} px-4 py-3 mb-3`}
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-sm font-semibold ${colors.text}`}
                    >
                      {group.stage}
                    </h3>
                    <span
                      className={`flex items-center justify-center size-6 rounded-full ${colors.accent} text-xs font-bold ${colors.text}`}
                    >
                      {group.items.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-3">
                  {group.items.length === 0 && (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 p-4 text-center">
                      <User className="size-5 mx-auto text-gray-300" />
                      <p className="mt-1 text-xs text-gray-400">
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
