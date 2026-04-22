"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SettingsScreen() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Badge>Prototype Settings</Badge>
          <CardTitle>Environment and rollout posture</CardTitle>
          <CardDescription>
            Clarix v1 is currently configured as a single-consultant demo workspace
            with local persistence. The data and service contracts are structured to
            swap into Supabase with minimal component churn.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Auth</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Demo local session now. Planned production path: Supabase
              email/password.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Storage</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Photos and app state are stored in the browser today. Planned
              production path: Supabase Storage plus relational tables.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Report export</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              PDF export is active in-browser using a lightweight generator for v1
              demo fidelity.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Risk engine</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Threshold-based assistive logic is embedded as structured app config,
              not exposed as a user-facing knowledge base.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
