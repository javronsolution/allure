"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Settings,
  Scissors,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "../ui/logo";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: Bottom bar */}
      <div className="md:hidden">
        <div className="fixed top-0 w-full z-50 bg-background h-14 flex items-center justify-center border-b">
            <Logo />
        </div>
        <div className="pb-20 pt-14">
             {children}
        </div>
        <nav className="fixed bottom-0 w-full z-50 border-t bg-background safe-area-bottom">
          <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-16",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
       
      </div>

      {/* Tablet+: Sidebar */}
      <div className="hidden md:flex z-50">
        <aside className="w-80 flex-col border-r bg-background">
          <div className="flex items-center justify-center gap-2 px-5 border-b h-14">
            <Logo />
          </div>
          <nav className="flex-1 flex flex-col gap-1 p-3">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-4 rounded-sm text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
       <div className="flex-1">
        <div className="h-14 border-b"></div>
        <div>
             {children}
        </div>
       </div>
      </div>
    </>
  );
}
