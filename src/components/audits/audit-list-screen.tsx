"use client";

import Link from "next/link";
import { useClarix } from "@/components/providers/app-provider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDate, percentage } from "@/lib/utils";

export function AuditListScreen() {
  const { audits, clients, sites } = useClarix();

  return (
    <Card>
      <CardHeader>
        <Badge>Audits</Badge>
        <CardTitle>Guided field assessments</CardTitle>
        <CardDescription>
          Every audit tracks section progress, findings, photos, plan inputs, and
          output generation.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {audits.map((audit) => {
          const client = clients.find((entry) => entry.id === audit.clientId);
          const site = sites.find((entry) => entry.id === audit.siteId);
          const completedSections = audit.sectionOrder.filter(
            (key) => audit.sections[key].status === "completed",
          ).length;

          return (
            <Link
              key={audit.id}
              href={`/audits/${audit.id}`}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5 transition-transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{site?.name}</p>
                  <p className="text-sm text-slate-500">{client?.name}</p>
                </div>
                <Badge tone={audit.status === "completed" ? "success" : "warning"}>
                  {audit.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{audit.summary}</p>
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                  <span>Progress</span>
                  <span>{percentage(completedSections, audit.sectionOrder.length)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${percentage(completedSections, audit.sectionOrder.length)}%`,
                    }}
                  />
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                {formatDate(audit.assessmentDate)}
              </p>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
