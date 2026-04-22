"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { FieldError, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatMeasurement } from "@/lib/utils";

const siteSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(2),
  facilityType: z.string().min(2),
  address: z.string().min(4),
  notes: z.string().optional(),
  sourceWaterType: z.string().min(2),
  pretreatmentSummary: z.string().min(2),
  criticalWaterPresent: z.boolean(),
  steamPresent: z.boolean(),
  hotWaterTempC: z.coerce.number().optional(),
  returnTempC: z.coerce.number().optional(),
  coldWaterTempC: z.coerce.number().optional(),
  disinfectantResidualMgL: z.coerce.number().optional(),
  deadLegsPresent: z.boolean(),
  recirculationStatus: z.string().min(2),
  populationRiskLevel: z.enum(["standard", "elevated", "high"]),
});

type SiteFormValues = z.infer<typeof siteSchema>;

export function SiteHub() {
  const { clients, sites, createSite } = useClarix();
  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema) as never,
    defaultValues: {
      clientId: clients[0]?.id ?? "",
      criticalWaterPresent: true,
      steamPresent: false,
      deadLegsPresent: false,
      populationRiskLevel: "standard",
      notes: "",
    },
  });

  React.useEffect(() => {
    if (!form.getValues("clientId") && clients[0]) {
      form.setValue("clientId", clients[0].id);
    }
  }, [clients, form]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <Badge>Sites</Badge>
          <CardTitle>Facility and system records</CardTitle>
          <CardDescription>
            Each site carries the operating context that audits and reports build
            from.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {sites.map((site) => {
            const client = clients.find((entry) => entry.id === site.clientId);
            return (
              <Link
                key={site.id}
                href={`/sites/${site.id}`}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition-colors hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{site.name}</p>
                    <p className="text-sm text-slate-500">{client?.name}</p>
                  </div>
                  <Badge
                    tone={
                      site.populationRiskLevel === "high"
                        ? "danger"
                        : site.populationRiskLevel === "elevated"
                          ? "warning"
                          : "muted"
                    }
                  >
                    {site.populationRiskLevel}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <p>Source: {site.sourceWaterType}</p>
                  <p>Recirculation: {site.recirculationStatus}</p>
                  <p>
                    Temps: {formatMeasurement(site.hotWaterTempC, "°C")},{" "}
                    {formatMeasurement(site.returnTempC, "°C")},{" "}
                    {formatMeasurement(site.coldWaterTempC, "°C")}
                  </p>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add site</CardTitle>
          <CardDescription>
            Create a site record ready for audit initiation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit((values) => {
              createSite({
                ...values,
                notes: values.notes ?? "",
              });
              form.reset({
                clientId: clients[0]?.id ?? "",
                criticalWaterPresent: true,
                steamPresent: false,
                deadLegsPresent: false,
                populationRiskLevel: "standard",
                notes: "",
              });
            })}
          >
            <FormField label="Client">
              <select
                {...form.register("clientId")}
                className="h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-[var(--ring)]"
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Site name">
              <Input {...form.register("name")} placeholder="North Tower Campus" />
              <FieldError message={form.formState.errors.name?.message} />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Facility type">
                <Input
                  {...form.register("facilityType")}
                  placeholder="Acute care hospital"
                />
              </FormField>
              <FormField label="Source water type">
                <Input {...form.register("sourceWaterType")} placeholder="Municipal" />
              </FormField>
            </div>
            <FormField label="Address">
              <Input
                {...form.register("address")}
                placeholder="123 Main Street, City, State"
              />
            </FormField>
            <FormField label="Pretreatment summary">
              <Textarea
                {...form.register("pretreatmentSummary")}
                placeholder="RO, filtration, softening, carbon..."
              />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Recirculation status">
                <Input
                  {...form.register("recirculationStatus")}
                  placeholder="Stable loop, under review, no recirc..."
                />
              </FormField>
              <FormField label="Population risk level">
                <select
                  {...form.register("populationRiskLevel")}
                  className="h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-[var(--ring)]"
                >
                  <option value="standard">Standard</option>
                  <option value="elevated">Elevated</option>
                  <option value="high">High</option>
                </select>
              </FormField>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Hot water (°C)">
                <Input type="number" step="0.1" {...form.register("hotWaterTempC")} />
              </FormField>
              <FormField label="Return temp (°C)">
                <Input type="number" step="0.1" {...form.register("returnTempC")} />
              </FormField>
              <FormField label="Cold water (°C)">
                <Input type="number" step="0.1" {...form.register("coldWaterTempC")} />
              </FormField>
              <FormField label="Residual (mg/L)">
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("disinfectantResidualMgL")}
                />
              </FormField>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" {...form.register("criticalWaterPresent")} />
                Critical water present
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" {...form.register("steamPresent")} />
                Steam present
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" {...form.register("deadLegsPresent")} />
                Dead legs present
              </label>
            </div>
            <FormField label="Notes">
              <Textarea
                {...form.register("notes")}
                placeholder="Known issues, expansion notes, or upcoming work."
              />
            </FormField>
            <Button type="submit">Create site</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
