"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import {
  demoTasks,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/demo-data";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  GraduationCap,
  Minus,
  School,
  ListFilter,
} from "lucide-react";

const priorityConfig: Record<
  TaskPriority,
  {
    label: string;
    icon: typeof ArrowUp;
    className: string;
    badgeClass: string;
  }
> = {
  high: {
    label: "高",
    icon: ArrowUp,
    className: "text-red-600",
    badgeClass: "bg-red-50 text-red-700 ring-1 ring-red-200/60",
  },
  medium: {
    label: "中",
    icon: Minus,
    className: "text-amber-600",
    badgeClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
  },
  low: {
    label: "低",
    icon: ArrowDown,
    className: "text-gray-400",
    badgeClass: "bg-gray-50 text-gray-600 ring-1 ring-gray-200/60",
  },
};

const statusConfig: Record<
  TaskStatus,
  { icon: typeof Circle; className: string; badgeClass: string }
> = {
  "未着手": {
    icon: Circle,
    className: "text-gray-400",
    badgeClass: "bg-gray-100 text-gray-600",
  },
  "進行中": {
    icon: Clock,
    className: "text-indigo-500",
    badgeClass: "bg-indigo-50 text-indigo-700",
  },
  "完了": {
    icon: CheckCircle2,
    className: "text-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-700",
  },
};

function isOverdue(dueDate: string, status: TaskStatus): boolean {
  if (status === "完了") return false;
  return new Date(dueDate) < new Date("2026-04-05");
}

function TaskRow({
  task,
  onStatusChange,
}: {
  task: Task;
  onStatusChange: (id: string, newStatus: TaskStatus) => void;
}) {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const PriorityIcon = priority.icon;
  const StatusIcon = status.icon;
  const overdue = isOverdue(task.dueDate, task.status);

  const allStatuses: TaskStatus[] = ["未着手", "進行中", "完了"];

  return (
    <div
      className={`group rounded-xl bg-white ring-1 ring-gray-200/60 shadow-sm hover:shadow-md transition-all ${
        task.status === "完了" ? "opacity-50" : ""
      } ${overdue ? "ring-red-200/80" : ""}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Status toggle */}
          <button
            onClick={() => {
              const idx = allStatuses.indexOf(task.status);
              const next = allStatuses[(idx + 1) % allStatuses.length];
              onStatusChange(task.id, next);
            }}
            className={`mt-0.5 shrink-0 ${status.className} hover:scale-110 transition-transform`}
            title={`現在: ${task.status}`}
          >
            <StatusIcon className="size-5" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3
                className={`text-sm font-semibold text-gray-900 leading-snug ${
                  task.status === "完了" ? "line-through text-gray-500" : ""
                }`}
              >
                {task.title}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${priority.badgeClass}`}
                >
                  <PriorityIcon className="size-3" />
                  {priority.label}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${status.badgeClass}`}
                >
                  {task.status}
                </span>
              </div>
            </div>

            <p className="mt-1 text-[13px] text-gray-500 leading-relaxed">
              {task.description}
            </p>

            <div className="mt-3 flex items-center gap-4 flex-wrap">
              {/* Due date */}
              <div
                className={`flex items-center gap-1.5 text-xs ${
                  overdue
                    ? "rounded-md bg-red-50 px-2 py-0.5 text-red-600 font-semibold"
                    : "text-gray-500"
                }`}
              >
                {overdue ? (
                  <AlertTriangle className="size-3.5" />
                ) : (
                  <Calendar className="size-3.5" />
                )}
                {task.dueDate}
                {overdue && " (期限超過)"}
              </div>

              {/* Category */}
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
                {task.category}
              </span>

              {/* Related */}
              {task.relatedTo && (
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                  {task.relatedTo.type === "school" ? (
                    <School className="size-3.5" />
                  ) : (
                    <GraduationCap className="size-3.5" />
                  )}
                  {task.relatedTo.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState(demoTasks);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">(
    "all"
  );

  function handleStatusChange(id: string, newStatus: TaskStatus) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
  }

  const filtered = tasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.status === "完了" && b.status !== "完了") return 1;
    if (a.status !== "完了" && b.status === "完了") return -1;
    const aOverdue = isOverdue(a.dueDate, a.status);
    const bOverdue = isOverdue(b.dueDate, b.status);
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const countByStatus = {
    total: tasks.length,
    "未着手": tasks.filter((t) => t.status === "未着手").length,
    "進行中": tasks.filter((t) => t.status === "進行中").length,
    "完了": tasks.filter((t) => t.status === "完了").length,
    overdue: tasks.filter((t) => isOverdue(t.dueDate, t.status)).length,
  };

  return (
    <>
      <Header title="タスク管理" />
      <div className="p-6 max-w-5xl space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl bg-white p-4 ring-1 ring-gray-200/60 shadow-sm">
            <p className="text-[11px] font-medium text-gray-500">全タスク</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">
              {countByStatus.total}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 ring-1 ring-gray-200/60 shadow-sm">
            <p className="text-[11px] font-medium text-gray-500">未着手</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-600">
              {countByStatus["未着手"]}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 ring-1 ring-gray-200/60 shadow-sm">
            <p className="text-[11px] font-medium text-gray-500">進行中</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-indigo-600">
              {countByStatus["進行中"]}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 ring-1 ring-gray-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-gray-500">期限超過</p>
              {countByStatus.overdue > 0 && (
                <AlertTriangle className="size-3.5 text-red-500" />
              )}
            </div>
            <p
              className={`mt-1.5 text-2xl font-bold tracking-tight ${
                countByStatus.overdue > 0 ? "text-red-600" : "text-gray-400"
              }`}
            >
              {countByStatus.overdue}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl bg-white p-4 ring-1 ring-gray-200/60 shadow-sm">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <ListFilter className="size-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-700">
                フィルター
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-gray-500 mr-1">ステータス:</span>
              {(["all", "未着手", "進行中", "完了"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                    filterStatus === s
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {s === "all" ? "すべて" : s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-gray-500 mr-1">優先度:</span>
              {(["all", "high", "medium", "low"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                    filterPriority === p
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {p === "all"
                    ? "すべて"
                    : p === "high"
                      ? "高"
                      : p === "medium"
                        ? "中"
                        : "低"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {sorted.length === 0 && (
            <div className="rounded-xl bg-white p-12 text-center ring-1 ring-gray-200/60 shadow-sm">
              <p className="text-sm text-gray-400">
                該当するタスクがありません。
              </p>
            </div>
          )}
          {sorted.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </div>
    </>
  );
}
