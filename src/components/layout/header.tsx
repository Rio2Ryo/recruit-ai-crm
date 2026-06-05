import Link from "next/link";
import { Bell, Search, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { RoleSwitcher } from "@/components/rbac/role-switcher";

export function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-6">
        <div>
          <h1 className="text-base font-semibold text-gray-900 tracking-tight">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-gray-400" />
            <Input
              className="h-8 w-56 rounded-lg bg-gray-50 pl-9 text-sm border-gray-200 focus:bg-white"
              placeholder="検索..."
            />
          </div>
          <RoleSwitcher />
          <Button variant="ghost" size="icon-sm" className="text-gray-500">
            <Bell className="size-4" />
          </Button>
          <Link
            href="/company/setup"
            className={buttonVariants({
              variant: "ghost",
              size: "icon-sm",
              className: "text-gray-500",
            })}
          >
            <Settings className="size-4" />
          </Link>
          <div className="ml-1 flex size-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
            山
          </div>
        </div>
      </div>
    </header>
  );
}
