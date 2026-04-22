"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { useClarix } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/sites", label: "Sites", icon: Activity },
  { href: "/audits", label: "Audits", icon: ClipboardList },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, logout, clients, audits } = useClarix();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-sidebar px-5 py-6 text-sidebar-foreground">
          <div className="mb-8 rounded-[1.75rem] bg-gradient-to-br from-primary to-accent p-5 text-primary-foreground shadow-[0_22px_50px_rgba(15,118,110,0.22)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Clarix
            </p>
            <h1 className="mt-2 font-display text-3xl leading-tight">
              Water Intelligence
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Consulting operating system for field audits, risk-backed findings,
              and polished water management outputs.
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Live Snapshot
            </p>
            <div className="mt-4 grid gap-4">
              <div>
                <p className="text-2xl font-semibold text-slate-900">
                  {clients.length}
                </p>
                <p className="text-sm text-slate-500">Active client records</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-900">
                  {audits.length}
                </p>
                <p className="text-sm text-slate-500">Audits in workspace</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-background/90 px-6 py-4 backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  Field-first v1
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  {navItems.find((item) => pathname.startsWith(item.href))?.label ??
                    "Clarix"}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone="muted">
                  Signed in as{" "}
                  <span className="ml-1 font-semibold text-slate-900">
                    {session?.name}
                  </span>
                </Badge>
                <Button variant="outline" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
