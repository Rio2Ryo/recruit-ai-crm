"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Building2, ClipboardList, GraduationCap, LayoutDashboard, School, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/company", label: "企業情報", icon: Building2 },
  { href: "/jobs", label: "求人", icon: Briefcase },
  { href: "/students", label: "候補者", icon: GraduationCap },
  { href: "/schools", label: "学校", icon: School },
  { href: "/applications", label: "選考", icon: ClipboardList },
  { href: "/members", label: "メンバー", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 border-r border-gray-200 bg-white min-h-screen flex-col">
      <div className="px-5 py-5 border-b border-gray-200">
        <Link href="/dashboard" className="block">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-600">Recruit AI CRM</p>
          <p className="mt-1 text-lg font-bold text-gray-900">採用CRM</p>
        </Link>
      </div>
      <div className="px-4 pt-4">
        <div className="rounded-xl bg-indigo-50 p-3 text-sm text-indigo-900">
          <p className="font-semibold">北信精工</p>
          <p className="mt-1 text-xs text-indigo-700">高卒採用の応募・学校接点・AIマッチングを一元管理</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition",
                pathname.startsWith(item.href)
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
