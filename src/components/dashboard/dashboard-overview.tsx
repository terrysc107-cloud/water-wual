"use client";

import Link from "next/link";
import { ArrowRight, ClipboardPlus, FileUp, Plus } from "lucide-react";
import { useClarix } from "@/components/providers/app-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export function DashboardOverview() {
  const { clients, sites, audits, reports, createAudit } = useClarix();
  const activeAudits = audits.filter((audit) => audit.status !== "completed");

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="surface-glow overflow-hidden">
          <CardHeader>
            <Badge>Today&apos;s control room</Badge>
            <CardTitle className="font-display text-4xl">
              Keep field evidence moving all the way to plan and report.
            </CardTitle>
            <CardDescription className="max-w-2xl">
              Clarix is tuned for live walkthroughs: fast section switching,
              visible save state, assistive risk logic, and clean handoff into
              the report package.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/clients">
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                New client
              </Button>
            </Link>
            <Link href="/sites">
              <Button variant="secondary" size="lg">
                <FileUp className="mr-2 h-4 w-4" />
                New site
              </Button>
            </Link>
            {sites[0] ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const auditId = createAudit(sites[0].id, sites[0].clientId);
                  window.location.assign(`/audits/${auditId}`);
                }}
              >
                <ClipboardPlus className="mr-2 h-4 w-4" />
                Start audit
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational Pulse</CardTitle>
            <CardDescription>Fast snapshot for the current workspace.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {[
              { label: "Clients", value: clients.length },
              { label: "Sites", value: sites.length },
              { label: "Active audits", value: activeAudits.length },
              { label: "Reports generated", value: reports.length },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Recent clients</CardTitle>
            <CardDescription>Quick re-entry to active accounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {clients.slice(0, 4).map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">{client.name}</p>
                  <p className="text-sm text-slate-500">{client.contact}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Recent audits</CardTitle>
            <CardDescription>Return to audits with active work.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {audits.slice(0, 4).map((audit) => (
              <Link
                key={audit.id}
                href={`/audits/${audit.id}`}
                className="block rounded-2xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{audit.summary}</p>
                  <Badge tone={audit.status === "completed" ? "success" : "warning"}>
                    {audit.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {formatDate(audit.assessmentDate)}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Recent reports</CardTitle>
            <CardDescription>Assessment packages ready to export again.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reports.slice(0, 4).map((report) => (
              <Link
                key={report.id}
                href="/reports"
                className="block rounded-2xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
              >
                <p className="font-medium text-slate-900">{report.title}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {formatDate(report.generatedAt)}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
