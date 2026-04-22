"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
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
import { formatDate } from "@/lib/utils";

const clientSchema = z.object({
  name: z.string().min(2),
  contact: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  address: z.string().min(4),
  facilityType: z.string().min(2),
  populationRiskLevel: z.enum(["standard", "elevated", "high"]),
  notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export function ClientHub() {
  const { clients, sites, audits, createClient } = useClarix();
  const [query, setQuery] = React.useState("");
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      populationRiskLevel: "standard",
      notes: "",
    },
  });

  const filtered = clients.filter((client) =>
    [client.name, client.contact, client.email, client.facilityType]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <Badge>Clients</Badge>
          <CardTitle>Consulting account records</CardTitle>
          <CardDescription>
            Track organization context, key contacts, sites, and recent audit
            activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search clients, contacts, or facility types"
              className="pl-9"
            />
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Sites</th>
                  <th className="px-4 py-3 font-medium">Last audit</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => {
                  const clientSites = sites.filter(
                    (site) => site.clientId === client.id,
                  );
                  const lastAudit = audits
                    .filter((audit) => audit.clientId === client.id)
                    .sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate))[0];

                  return (
                    <tr key={client.id} className="border-t border-slate-200">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{client.name}</p>
                          <p className="text-slate-500">{client.facilityType}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">{client.contact}</td>
                      <td className="px-4 py-4">{clientSites.length}</td>
                      <td className="px-4 py-4">
                        {lastAudit ? formatDate(lastAudit.assessmentDate) : "No audits yet"}
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/clients/${client.id}`} className="font-medium text-primary">
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add client</CardTitle>
          <CardDescription>
            Create the top-level organization record before adding sites and
            audits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit((values) => {
              createClient({
                ...values,
                notes: values.notes ?? "",
              });
              form.reset({ populationRiskLevel: "standard", notes: "" });
            })}
          >
            <FormField label="Client name">
              <Input
                {...form.register("name")}
                placeholder="St. Mary Regional Medical Center"
              />
              <FieldError message={form.formState.errors.name?.message} />
            </FormField>
            <FormField label="Primary contact">
              <Input {...form.register("contact")} placeholder="Dana Whitlock" />
              <FieldError message={form.formState.errors.contact?.message} />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Email">
                <Input {...form.register("email")} placeholder="contact@site.org" />
                <FieldError message={form.formState.errors.email?.message} />
              </FormField>
              <FormField label="Phone">
                <Input {...form.register("phone")} placeholder="(555) 555-1212" />
                <FieldError message={form.formState.errors.phone?.message} />
              </FormField>
            </div>
            <FormField label="Address">
              <Input
                {...form.register("address")}
                placeholder="123 Main Street, City, State"
              />
              <FieldError message={form.formState.errors.address?.message} />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Facility type">
                <Input {...form.register("facilityType")} placeholder="Hospital system" />
                <FieldError message={form.formState.errors.facilityType?.message} />
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
            <FormField label="Notes">
              <Textarea
                {...form.register("notes")}
                placeholder="Commercial context, known risks, or billing notes."
              />
            </FormField>
            <Button type="submit">Create client</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
