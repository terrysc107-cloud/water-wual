"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useClarix } from "@/components/providers/app-provider";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isReady, session } = useClarix();
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (!isReady) return;
    if (!session && pathname !== "/login") {
      router.replace("/login");
    }
  }, [isReady, pathname, router, session]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-lg">
          Loading Clarix workspace...
        </div>
      </div>
    );
  }

  if (!session) return null;

  return <>{children}</>;
}
