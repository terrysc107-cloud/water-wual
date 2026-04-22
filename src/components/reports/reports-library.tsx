"use client";

import * as React from "react";
import { FileDown, FileText } from "lucide-react";
import { useClarix } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { downloadReportPdf } from "@/lib/pdf";
import { buildPlanDraft } from "@/lib/generation";
import { evaluateRiskRules } from "@/lib/risk-rules";
import { formatDate } from "@/lib/utils";

export function ReportsLibrary() {
  const { reports, clients, sites, audits, findings, plans, generateReport } =
    useClarix();
  const [activeReportId, setActiveReportId] = React.useState(reports[0]?.id);
  const activeReport = reports.find((report) => report.id === activeReportId) ?? reports[0];

  const preview = React.useMemo(() => {
    if (!activeReport) return null;
    return generateReport(activeReport.auditId);
  }, [activeReport, generateReport]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <CardTitle>Reports library</CardTitle>
          <CardDescription>
            Review generated assessment packages and export refreshed PDFs on
            demand.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reports.map((report) => {
            const client = clients.find((entry) => entry.id === report.clientId);
            const site = sites.find((entry) => entry.id === report.siteId);
            return (
              <button
                key={report.id}
                type="button"
                onClick={() => setActiveReportId(report.id)}
                className={`w-full rounded-[1.5rem] border p-4 text-left transition-colors ${
                  activeReport?.id === report.id
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{report.title}</p>
                    <p className="text-sm text-slate-500">
                      {client?.name} • {site?.name}
                    </p>
                  </div>
                  <FileText className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{report.summary}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                  {formatDate(report.generatedAt)}
                </p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{activeReport?.title ?? "No report selected"}</CardTitle>
          <CardDescription>
            Executive preview of the selected report with downloadable PDF export.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeReport && preview ? (
            <>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    const audit = audits.find((entry) => entry.id === activeReport.auditId);
                    const client = clients.find((entry) => entry.id === activeReport.clientId);
                    const site = sites.find((entry) => entry.id === activeReport.siteId);
                    if (!audit || !client || !site) return;

                    const plan =
                      plans.find((entry) => entry.auditId === activeReport.auditId) ??
                      buildPlanDraft({
                        audit,
                        client,
                        site,
                        findings: findings.filter(
                          (finding) => finding.auditId === activeReport.auditId,
                        ),
                        rules: evaluateRiskRules(audit, site),
                      });

                    downloadReportPdf({
                      title: activeReport.title,
                      subtitle: `${client.name} • ${site.name}`,
                      sections: preview.sections,
                      plan,
                    });
                  }}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <div className="space-y-4">
                  {preview.sections.map((section) => (
                    <div key={section.title}>
                      <p className="font-semibold text-slate-900">{section.title}</p>
                      <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
                        {section.body.slice(0, 6).map((line) => (
                          <li key={line}>• {line}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              Generate a report from an audit to populate the reports library.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
