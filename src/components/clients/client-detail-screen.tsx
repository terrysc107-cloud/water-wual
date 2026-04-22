"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ClipboardPlus, MapPin } from "lucide-react";
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

export function ClientDetailScreen({ clientId }: { clientId: string }) {
  const { clients, sites, audits, reports, createAudit } = useClarix();
  const client = clients.find((entry) => entry.id === clientId);

  if (!client) notFound();

  const clientSites = sites.filter((site) => site.clientId === client.id);
  const clientAudits = audits.filter((audit) => audit.clientId === client.id);
  const clientReports = reports.filter((report) => report.clientId === client.id);

  return (
    <div className="space-y-6">
      <Card className="surface-glow">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge>{client.populationRiskLevel} risk profile</Badge>
              <CardTitle className="font-display text-4xl">{client.name}</CardTitle>
              <CardDescription className="max-w-2xl">
                {client.notes || "No additional client notes recorded."}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/sites">
                <Button variant="secondary">Add site</Button>
              </Link>
              {clientSites[0] ? (
                <Button
                  onClick={() => {
                    const auditId = createAudit(clientSites[0].id, client.id);
                    window.location.assign(`/audits/${auditId}`);
                  }}
                >
                  <ClipboardPlus className="mr-2 h-4 w-4" />
                  Start audit
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
            <p className="text-sm font-semibold text-slate-900">Primary contact</p>
            <p className="mt-2 text-sm text-slate-600">{client.contact}</p>
            <p className="text-sm text-slate-500">{client.email}</p>
            <p className="text-sm text-slate-500">{client.phone}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
            <p className="text-sm font-semibold text-slate-900">Address</p>
            <div className="mt-2 flex gap-2 text-sm text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              {client.address}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
            <p className="text-sm font-semibold text-slate-900">Recent activity</p>
            <p className="mt-2 text-sm text-slate-600">
              {clientAudits.length} audits, {clientReports.length} reports
            </p>
            <p className="text-sm text-slate-500">
              Updated {formatDate(client.updatedAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Sites</CardTitle>
            <CardDescription>Facilities and systems under this client.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientSites.map((site) => (
              <Link
                key={site.id}
                href={`/sites/${site.id}`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition-colors hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">{site.name}</p>
                  <p className="text-sm text-slate-500">{site.facilityType}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Audits</CardTitle>
            <CardDescription>Current and completed assessment work.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientAudits.map((audit) => (
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
            <CardTitle>Reports</CardTitle>
            <CardDescription>Generated deliverables for this account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientReports.map((report) => (
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
      </div>
    </div>
  );
}
