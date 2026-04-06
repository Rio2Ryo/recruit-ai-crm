"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { demoMatchCandidates, type MatchCandidate } from "@/lib/demo-data";
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Star,
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
      <span className="w-28 text-xs text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full ${color} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-10 text-right">
        {score}%
      </span>
    </div>
  );
}

function MatchCard({ candidate }: { candidate: MatchCandidate }) {
  const [expanded, setExpanded] = useState(false);

  const scoreBgClass =
    candidate.overallScore >= 90
      ? "from-emerald-500 to-emerald-600"
      : candidate.overallScore >= 80
        ? "from-indigo-500 to-indigo-600"
        : candidate.overallScore >= 70
          ? "from-amber-500 to-amber-600"
          : "from-gray-400 to-gray-500";

  return (
    <Card className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Score circle */}
          <div
            className={`shrink-0 size-16 rounded-2xl bg-gradient-to-br ${scoreBgClass} flex items-center justify-center`}
          >
            <span className="text-xl font-bold text-white">
              {candidate.overallScore}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {candidate.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {candidate.school} / {candidate.department}
                </p>
                <p className="text-xs text-indigo-600 mt-1">
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
          className="mt-4 flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 transition"
        >
          {expanded ? (
            <>
              <ChevronUp className="size-4" />
              詳細を閉じる
            </>
          ) : (
            <>
              <ChevronDown className="size-4" />
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
              <Sparkles className="size-4 text-indigo-500" />
              <h4 className="text-sm font-semibold text-gray-900">
                AIマッチ理由
              </h4>
            </div>
            <ul className="space-y-2">
              {candidate.matchReasons.map((reason, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span className="shrink-0 mt-1 size-1.5 rounded-full bg-indigo-400" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Interview Questions */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="size-4 text-violet-500" />
              <h4 className="text-sm font-semibold text-gray-900">
                推奨面接質問
              </h4>
            </div>
            <ol className="space-y-2">
              {candidate.interviewQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="shrink-0 mt-0.5 flex size-5 items-center justify-center rounded-full bg-violet-100 text-xs font-medium text-violet-700">
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
              <Lightbulb className="size-4 text-amber-500" />
              <h4 className="text-sm font-semibold text-gray-900">
                企業アピールポイント
              </h4>
            </div>
            <ul className="space-y-2">
              {candidate.appealPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <Star className="shrink-0 mt-0.5 size-4 text-amber-400" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
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
          <Card className="p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              候補者数
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {demoMatchCandidates.length}
            </p>
            <p className="mt-1 text-sm text-gray-500">AI分析済み</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              平均マッチ度
            </p>
            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {avgScore}%
            </p>
            <p className="mt-1 text-sm text-gray-500">全候補者の平均</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              高マッチ(80%+)
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {highMatch}名
            </p>
            <p className="mt-1 text-sm text-gray-500">優先アプローチ推奨</p>
          </Card>
        </div>

        {/* Sort control */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">並び替え:</span>
          <button
            onClick={() => setSortBy("score")}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              sortBy === "score"
                ? "bg-indigo-100 text-indigo-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            マッチ度順
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              sortBy === "name"
                ? "bg-indigo-100 text-indigo-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
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
