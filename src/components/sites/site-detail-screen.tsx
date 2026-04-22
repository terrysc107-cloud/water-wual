"use client";

import { notFound } from "next/navigation";
import { useClarix } from "@/components/providers/app-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, formatMeasurement } from "@/lib/utils";

export function SiteDetailScreen({ siteId }: { siteId: string }) {
  const { clients, sites, audits, findings, reports, createAudit } = useClarix();
  const site = sites.find((entry) => entry.id === siteId);

  if (!site) notFound();

  const client = clients.find((entry) => entry.id === site.clientId);
  const siteAudits = audits.filter((audit) => audit.siteId === site.id);
  const siteFindings = findings.filter((finding) => finding.siteId === site.id);
  const siteReports = reports.filter((report) => report.siteId === site.id);

  return (
    <div className="space-y-6">
      <Card className="surface-glow">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge
                tone={
                  site.populationRiskLevel === "high"
                    ? "danger"
                    : site.populationRiskLevel === "elevated"
                      ? "warning"
                      : "muted"
                }
              >
                {site.populationRiskLevel} risk site
              </Badge>
              <CardTitle className="font-display text-4xl">{site.name}</CardTitle>
              <p className="text-sm text-slate-600">
                {client?.name} • {site.facilityType}
              </p>
            </div>
            <Button
              onClick={() => {
                const auditId = createAudit(site.id, site.clientId);
                window.location.assign(`/audits/${auditId}`);
              }}
            >
              Start audit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
            <p className="text-sm text-slate-500">Source water</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {site.sourceWaterType}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
            <p className="text-sm text-slate-500">Thermal control</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {formatMeasurement(site.hotWaterTempC, "°C")} /{" "}
              {formatMeasurement(site.returnTempC, "°C")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
            <p className="text-sm text-slate-500">Cold + residual</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {formatMeasurement(site.coldWaterTempC, "°C")} /{" "}
              {formatMeasurement(site.disinfectantResidualMgL, " mg/L")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
            <p className="text-sm text-slate-500">Recirculation</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {site.recirculationStatus}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>System summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>{site.pretreatmentSummary}</p>
            <p>Critical water present: {site.criticalWaterPresent ? "Yes" : "No"}</p>
            <p>Steam present: {site.steamPresent ? "Yes" : "No"}</p>
            <p>Dead legs present: {site.deadLegsPresent ? "Yes" : "No"}</p>
            <p>{site.notes || "No additional notes recorded."}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Audit history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {siteAudits.map((audit) => (
              <div key={audit.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">
                    {formatDate(audit.assessmentDate)}
                  </p>
                  <Badge tone={audit.status === "completed" ? "success" : "warning"}>
                    {audit.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">{audit.summary}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Findings and reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>{siteFindings.length} findings across all audits.</p>
            <p>{siteReports.length} generated reports.</p>
            <p>Latest update: {formatDate(site.updatedAt)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
