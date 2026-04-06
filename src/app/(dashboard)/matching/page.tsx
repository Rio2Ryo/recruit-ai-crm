"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { demoMatchCandidates, type MatchCandidate } from "@/lib/demo-data";
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 90
      ? "bg-emerald-500"
      : score >= 80
        ? "bg-indigo-500"
        : score >= 70
          ? "bg-amber-500"
          : "bg-gray-400";
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-[11px] text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-100">
        <div
          className={`h-1.5 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[11px] font-semibold text-gray-700 w-9 text-right tabular-nums">
        {score}%
      </span>
    </div>
  );
}

function ScoreRing({
  score,
  size = "lg",
}: {
  score: number;
  size?: "sm" | "lg";
}) {
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 90
      ? "stroke-emerald-500"
      : score >= 80
        ? "stroke-indigo-500"
        : score >= 70
          ? "stroke-amber-500"
          : "stroke-gray-400";
  const dim = size === "lg" ? "size-16" : "size-12";
  const textSize = size === "lg" ? "text-lg" : "text-sm";

  return (
    <div className={`relative ${dim} shrink-0`}>
      <svg className="size-full -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          strokeWidth="3"
          className="stroke-gray-100"
        />
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${color} transition-all duration-700`}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center ${textSize} font-bold text-gray-900`}
      >
        {score}
      </span>
    </div>
  );
}

function MatchCard({ candidate }: { candidate: MatchCandidate }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <ScoreRing score={candidate.overallScore} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {candidate.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {candidate.school} / {candidate.department}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                  <Target className="size-3" />
                  {candidate.jobTitle}
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-1.5">
              <ScoreBar label="属性スコア" score={candidate.attributeScore} />
              <ScoreBar
                label="希望マッチ度"
                score={candidate.preferenceScore}
              />
              <ScoreBar label="実績スコア" score={candidate.historyScore} />
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition"
        >
          {expanded ? (
            <>
              <ChevronUp className="size-3.5" />
              詳細を閉じる
            </>
          ) : (
            <>
              <ChevronDown className="size-3.5" />
              AI分析の詳細を見る
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/50">
          {/* Match Reasons */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex size-6 items-center justify-center rounded-md bg-indigo-100">
                <Sparkles className="size-3.5 text-indigo-600" />
              </div>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                AIマッチ理由
              </h4>
            </div>
            <ul className="space-y-2.5">
              {candidate.matchReasons.map((reason, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed"
                >
                  <span className="shrink-0 mt-2 size-1 rounded-full bg-indigo-400" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Interview Questions */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex size-6 items-center justify-center rounded-md bg-violet-100">
                <MessageSquare className="size-3.5 text-violet-600" />
              </div>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                推奨面接質問
              </h4>
            </div>
            <ol className="space-y-2.5">
              {candidate.interviewQuestions.map((q, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed"
                >
                  <span className="shrink-0 mt-0.5 flex size-5 items-center justify-center rounded-full bg-violet-50 text-[10px] font-bold text-violet-600 ring-1 ring-violet-200/60">
                    {i + 1}
                  </span>
                  {q}
                </li>
              ))}
            </ol>
          </div>

          {/* Appeal Points */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex size-6 items-center justify-center rounded-md bg-amber-100">
                <Lightbulb className="size-3.5 text-amber-600" />
              </div>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                企業アピールポイント
              </h4>
            </div>
            <ul className="space-y-2.5">
              {candidate.appealPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed"
                >
                  <Star className="shrink-0 mt-0.5 size-4 text-amber-400" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MatchingPage() {
  const [sortBy, setSortBy] = useState<"score" | "name">("score");

  const sorted = [...demoMatchCandidates].sort((a, b) =>
    sortBy === "score"
      ? b.overallScore - a.overallScore
      : a.name.localeCompare(b.name, "ja")
  );

  const avgScore = Math.round(
    demoMatchCandidates.reduce((s, c) => s + c.overallScore, 0) /
      demoMatchCandidates.length
  );
  const highMatch = demoMatchCandidates.filter(
    (c) => c.overallScore >= 80
  ).length;

  return (
    <>
      <Header title="AIマッチング" />
      <div className="p-6 max-w-5xl space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50">
                <Users className="size-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">候補者数</p>
                <p className="text-2xl font-bold tracking-tight text-gray-900">
                  {demoMatchCandidates.length}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-gray-400">AI分析済み</p>
          </div>
          <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-violet-50">
                <TrendingUp className="size-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">
                  平均マッチ度
                </p>
                <p className="text-2xl font-bold tracking-tight text-indigo-600">
                  {avgScore}%
                </p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-gray-400">全候補者の平均</p>
          </div>
          <div className="rounded-xl bg-white p-5 ring-1 ring-gray-200/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50">
                <Target className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">
                  高マッチ(80%+)
                </p>
                <p className="text-2xl font-bold tracking-tight text-emerald-600">
                  {highMatch}名
                </p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-gray-400">
              優先アプローチ推奨
            </p>
          </div>
        </div>

        {/* Sort control */}
        <div className="flex items-center gap-1 rounded-lg bg-white p-1 ring-1 ring-gray-200/60 w-fit shadow-sm">
          <button
            onClick={() => setSortBy("score")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              sortBy === "score"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            マッチ度順
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              sortBy === "name"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            名前順
          </button>
        </div>

        {/* Candidate list */}
        <div className="space-y-4">
          {sorted.map((candidate) => (
            <MatchCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      </div>
    </>
  );
}
