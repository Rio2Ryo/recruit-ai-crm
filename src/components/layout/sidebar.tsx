"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: "📊" },
  { href: "/company", label: "企業情報", icon: "🏢" },
  { href: "/jobs", label: "求人", icon: "📋" },
  { href: "/students", label: "候補者", icon: "👤" },
  { href: "/schools", label: "学校", icon: "🏫" },
  { href: "/applications", label: "選考", icon: "📁" },
  { href: "/members", label: "メンバー", icon: "👥" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-gray-200 bg-white min-h-screen flex flex-col">
      <div className="px-4 py-5 border-b border-gray-200">
        <Link href="/dashboard" className="text-lg font-bold text-gray-900">
          採用CRM
        </Link>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
              pathname.startsWith(item.href)
                ? "bg-indigo-50 text-indigo-700 font-medium"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
