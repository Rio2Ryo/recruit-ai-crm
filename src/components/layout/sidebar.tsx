"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  CheckSquare,
  FileText,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  MessageCircle,
  School,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    label: null,
    items: [
      { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
    ],
  },
  {
    label: "採用管理",
    items: [
      { href: "/company", label: "企業情報", icon: Building2 },
      { href: "/jobs", label: "求人", icon: Briefcase },
      { href: "/students", label: "候補者", icon: GraduationCap },
      { href: "/resumes", label: "履歴書DB", icon: FileText },
      { href: "/schedules", label: "日程調整", icon: CalendarDays },
      { href: "/schools", label: "学校", icon: School },
    ],
  },
  {
    label: "AI / ワークフロー",
    items: [
      { href: "/matching", label: "AIマッチング", icon: Sparkles },
      { href: "/applications", label: "選考パイプライン", icon: ClipboardList },
      { href: "/tasks", label: "タスク", icon: CheckSquare },
      { href: "/pipeline", label: "歩留まり管理", icon: BarChart3 },
    ],
  },
  {
    label: "設定",
    items: [
      { href: "/members", label: "メンバー", icon: Users },
      { href: "/settings/line", label: "LINE応募導線", icon: MessageCircle },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-[260px] shrink-0 flex-col bg-[#1e1b4b] min-h-screen">
      {/* Logo / Brand */}
      <div className="px-5 py-5">
        <Link href="/dashboard" className="block">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500">
              <Sparkles className="size-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">
                Recruit AI
              </p>
              <p className="text-[10px] text-indigo-300 tracking-wide">
                採用CRM
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Company pill */}
      <div className="mx-4 mb-3">
        <div className="rounded-lg bg-white/[0.08] px-3 py-2.5 backdrop-blur">
          <p className="text-xs font-semibold text-white">企業情報未登録</p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-indigo-300">
            実データのみ表示
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.label && (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-indigo-400/70">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-all duration-150",
                      isActive
                        ? "bg-indigo-500/20 text-white font-medium shadow-sm"
                        : "text-indigo-200/80 hover:bg-white/[0.06] hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[18px]",
                        isActive ? "text-indigo-400" : "text-indigo-400/50"
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mx-4 mb-4 rounded-lg bg-gradient-to-r from-indigo-500/20 to-violet-500/20 p-3">
        <p className="text-[11px] font-medium text-indigo-200">
          AI分析ステータス
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-indigo-300">実データ待機中</span>
        </div>
      </div>
    </aside>
  );
}
