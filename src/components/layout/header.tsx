import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";

export function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 h-16 border-b border-gray-200 bg-white/95 backdrop-blur flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-500">中小製造業向け 高卒採用支援ダッシュボード</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input className="w-64 pl-9" placeholder="候補者・学校・求人を検索" />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Bell className="size-4" />
          通知
        </Button>
        <Link href="/company/setup" className={buttonVariants({ size: "sm" })}>
          企業設定
        </Link>
      </div>
    </header>
  );
}
