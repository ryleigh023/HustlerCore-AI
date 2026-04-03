"use client";

import clsx from "clsx";
import { BarChart3, Home, MessageCircle, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/claims", label: "Claims", icon: Shield },
  { href: "/analytics", label: "ROI", icon: BarChart3 },
  { href: "/chat", label: "Ask", icon: MessageCircle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-950 pb-24 text-slate-50">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-slate-950/90 px-4 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300/90">
              HustlerCore
            </p>
            <p className="text-sm font-semibold text-white">Income shield</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-400">
            PWA
          </span>
        </div>
      </header>
      <main className="flex-1 px-4 pt-4">{children}</main>
      <nav
        className="fixed bottom-0 left-0 right-0 z-10 border-t border-white/5 bg-slate-950/95 backdrop-blur"
        aria-label="Primary"
      >
        <div className="mx-auto flex max-w-md justify-around px-2 py-2">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium",
                  active ? "text-sky-300" : "text-slate-500 hover:text-slate-300",
                )}
              >
                <Icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
