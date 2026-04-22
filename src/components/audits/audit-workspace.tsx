"use client";

import * as React from "react";
import { notFound } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  CheckCircle2,
  Plus,
  Save,
} from "lucide-react";
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
import { auditSectionConfig, auditSectionLookup } from "@/lib/audit-config";
import { downloadReportPdf } from "@/lib/pdf";
import { evaluateRiskRules } from "@/lib/risk-rules";
import { createId, formatDate, percentage } from "@/lib/utils";
import {
  type AuditSectionKey,
  type EquipmentAlignmentEntry,
  type Finding,
} from "@/lib/types";

type GeneratedReport = ReturnType<ReturnType<typeof useClarix>["generateReport"]>;

export function AuditWorkspace({ auditId }: { auditId: string }) {
  const {
    audits,
    sites,
    clients,
    findings,
    photos,
    plans,
    reports,
    updateAuditSection,
    updateAuditStatus,
    addFinding,
    updateFinding,
    addPhoto,
    generatePlan,
    generateReport,
  } = useClarix();

  const audit = audits.find((entry) => entry.id === auditId);
  if (!audit) notFound();
  const site = sites.find((entry) => entry.id === audit.siteId);
  const client = clients.find((entry) => entry.id === audit.clientId);
  if (!site || !client) notFound();

  const [activeSection, setActiveSection] = React.useState<AuditSectionKey>(
    audit.sectionOrder[0],
  );
  const [saveState, setSaveState] = React.useState("Saved");
  const [draftFinding, setDraftFinding] = React.useState<Partial<Finding> | null>(null);
  const [reportPreview, setReportPreview] = React.useState<GeneratedReport | null>(null);
  const [generatedPlan, setGeneratedPlan] = React.useState(
    plans.find((entry) => entry.auditId === audit.id) ?? null,
  );

  const activeConfig = auditSectionLookup[activeSection];
  const activeSectionState = audit.sections[activeSection];
  const scopedPhotos = photos.filter((photo) => photo.auditId === audit.id);
  const auditFindings = findings.filter((finding) => finding.auditId === audit.id);
  const riskRules = evaluateRiskRules(audit, site);
  const activeRules = riskRules.filter((rule) => rule.sectionKey === activeSection);
  const completedSections = audit.sectionOrder.filter(
    (key) => audit.sections[key].status === "completed",
  ).length;

  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(activeConfig.schema as never) as never,
    values: activeSectionState.response,
  });

  React.useEffect(() => {
    form.reset(activeSectionState.response);
  }, [activeSectionState.response, form]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = form.watch((values) => {
      setSaveState("Saving...");
      const timeout = window.setTimeout(() => {
        updateAuditSection(audit.id, activeSection, values as Record<string, unknown>);
        setSaveState(
          `Saved ${new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}`,
        );
      }, 650);

      return () => window.clearTimeout(timeout);
    });
    return () => subscription.unsubscribe();
  }, [activeSection, audit.id, form, updateAuditSection]);

  const renderField = (field: (typeof activeConfig.fields)[number]) => {
    const error = form.formState.errors[field.name]?.message;

    if (field.type === "textarea") {
      return (
        <FormField key={field.name} label={field.label} description={field.description}>
          <Textarea placeholder={field.placeholder} {...form.register(field.name)} />
          <FieldError message={typeof error === "string" ? error : undefined} />
        </FormField>
      );
    }

    if (field.type === "checkbox") {
      return (
        <label
          key={field.name}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 text-sm text-slate-700"
        >
          <input type="checkbox" {...form.register(field.name)} />
          <span>{field.label}</span>
        </label>
      );
    }

    if (field.type === "select") {
      return (
        <FormField key={field.name} label={field.label} description={field.description}>
          <select
            {...form.register(field.name)}
            className="h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-[var(--ring)]"
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      );
    }

    if (field.type === "multi-select") {
      const selected = Array.isArray(form.watch(field.name))
        ? (form.watch(field.name) as string[])
        : [];

      return (
        <FormField key={field.name} label={field.label} description={field.description}>
          <div className="grid gap-2 sm:grid-cols-2">
            {field.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? [...selected, option.value]
                      : selected.filter((value) => value !== option.value);
                    form.setValue(field.name, next, { shouldDirty: true });
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </FormField>
      );
    }

    return (
      <FormField key={field.name} label={field.label} description={field.description}>
        <Input
          type={
            field.type === "number"
              ? "number"
              : field.type === "date"
                ? "date"
                : "text"
          }
          step={field.type === "number" ? "0.1" : undefined}
          placeholder={field.placeholder}
          {...form.register(field.name, {
            valueAsNumber: field.type === "number",
          })}
        />
        <FieldError message={typeof error === "string" ? error : undefined} />
      </FormField>
    );
  };

  const entries = Array.isArray(activeSectionState.response.entries)
    ? (activeSectionState.response.entries as EquipmentAlignmentEntry[])
    : [];

  const handleEquipmentEntryChange = (
    id: string,
    patch: Partial<EquipmentAlignmentEntry>,
  ) => {
    const next = entries.map((entry) =>
      entry.id === id ? { ...entry, ...patch } : entry,
    );
    form.setValue("entries", next);
    updateAuditSection(audit.id, "equipment_alignment", { entries: next });
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    sectionKey: AuditSectionKey,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addPhoto({
        clientId: client.id,
        siteId: site.id,
        auditId: audit.id,
        sectionKey,
        caption: file.name,
        includeInAppendix: true,
        dataUrl: String(reader.result),
      });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const activeFindingCount = auditFindings.filter(
    (finding) => finding.linkedSectionKey === activeSection,
  ).length;

  const handleConvertRuleToFinding = (ruleId: string) => {
    const rule = riskRules.find((entry) => entry.ruleId === ruleId);
    if (!rule) return;
    setDraftFinding({
      category: rule.category,
      severityTier: rule.suggestedSeverityTier,
      title: rule.title,
      description: rule.triggerReason,
      evidence: rule.actualState,
      recommendation: `Address according to ${rule.recommendedActionWindow.toLowerCase()} response window and document follow-up verification.`,
      idealState: rule.idealState,
      actualState: rule.actualState,
      riskExplanation: rule.riskExplanation,
      linkedSectionKey: rule.sectionKey,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="surface-glow">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <Badge>{client.name}</Badge>
              <CardTitle className="font-display text-4xl">{site.name}</CardTitle>
              <CardDescription>
                {site.facilityType} • {formatDate(audit.assessmentDate)} •{" "}
                {audit.assessorName}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="muted">
                <Save className="mr-2 h-3.5 w-3.5" />
                {saveState}
              </Badge>
              <Button variant="secondary" onClick={() => updateAuditStatus(audit.id, "completed")}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete audit
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <Card className="h-fit xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle>Audit progress</CardTitle>
            <CardDescription>
              {completedSections} of {audit.sectionOrder.length} sections completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-primary"
                style={{
                  width: `${percentage(completedSections, audit.sectionOrder.length)}%`,
                }}
              />
            </div>
            <div className="space-y-2">
              {auditSectionConfig.map((section) => {
                const isActive = section.key === activeSection;
                const isDone = audit.sections[section.key].status === "completed";
                const ruleCount = riskRules.filter(
                  (rule) => rule.sectionKey === section.key,
                ).length;
                return (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => setActiveSection(section.key)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-900">{section.title}</p>
                      {ruleCount > 0 ? (
                        <Badge tone="danger">{ruleCount}</Badge>
                      ) : isDone ? (
                        <Badge tone="success">Done</Badge>
                      ) : (
                        <Badge tone="muted">Open</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {section.completionDescription}
                    </p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Badge tone="default">{activeConfig.title}</Badge>
              <CardTitle>{activeConfig.description}</CardTitle>
              <CardDescription>
                Capture structured observations first, then enrich with narrative
                where it adds signal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {activeSection === "equipment_alignment" ? (
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Equipment name">
                          <Input
                            value={entry.equipmentName}
                            onChange={(event) =>
                              handleEquipmentEntryChange(entry.id, {
                                equipmentName: event.target.value,
                              })
                            }
                          />
                        </FormField>
                        <FormField label="Manufacturer">
                          <Input
                            value={entry.manufacturer}
                            onChange={(event) =>
                              handleEquipmentEntryChange(entry.id, {
                                manufacturer: event.target.value,
                              })
                            }
                          />
                        </FormField>
                        <FormField label="Model">
                          <Input
                            value={entry.model}
                            onChange={(event) =>
                              handleEquipmentEntryChange(entry.id, {
                                model: event.target.value,
                              })
                            }
                          />
                        </FormField>
                        <FormField label="Required water type">
                          <Input
                            value={entry.requiredWaterType}
                            onChange={(event) =>
                              handleEquipmentEntryChange(entry.id, {
                                requiredWaterType: event.target.value,
                              })
                            }
                          />
                        </FormField>
                        <FormField label="Current water type">
                          <Input
                            value={entry.currentWaterType}
                            onChange={(event) =>
                              handleEquipmentEntryChange(entry.id, {
                                currentWaterType: event.target.value,
                              })
                            }
                          />
                        </FormField>
                        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={entry.aligned}
                            onChange={(event) =>
                              handleEquipmentEntryChange(entry.id, {
                                aligned: event.target.checked,
                              })
                            }
                          />
                          Supply aligned to requirement
                        </label>
                      </div>
                      <FormField label="Comments">
                        <Textarea
                          value={entry.comments}
                          onChange={(event) =>
                            handleEquipmentEntryChange(entry.id, {
                              comments: event.target.value,
                            })
                          }
                        />
                      </FormField>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const next = [
                        ...entries,
                        {
                          id: createId("eq"),
                          equipmentName: "",
                          manufacturer: "",
                          model: "",
                          requiredWaterType: "",
                          currentWaterType: "",
                          aligned: true,
                          comments: "",
                        },
                      ];
                      form.setValue("entries", next);
                      updateAuditSection(audit.id, "equipment_alignment", { entries: next });
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add equipment
                  </Button>
                </div>
              ) : activeSection === "findings" ? (
                <div className="space-y-4">
                  {auditFindings.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                      No findings yet. Use the right rail or convert a triggered rule
                      into a managed finding.
                    </div>
                  ) : (
                    auditFindings.map((finding) => (
                      <div key={finding.id} className="rounded-3xl border border-slate-200 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{finding.title}</p>
                            <p className="text-sm text-slate-500">{finding.description}</p>
                          </div>
                          <Badge
                            tone={
                              finding.severityTier === "T1"
                                ? "danger"
                                : finding.severityTier === "T2"
                                  ? "warning"
                                  : "muted"
                            }
                          >
                            {finding.severityTier}
                          </Badge>
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <FormField label="Recommendation">
                            <Textarea
                              value={finding.recommendation}
                              onChange={(event) =>
                                updateFinding(finding.id, {
                                  recommendation: event.target.value,
                                })
                              }
                            />
                          </FormField>
                          <FormField label="Severity override">
                            <select
                              value={finding.severityTier}
                              onChange={(event) =>
                                updateFinding(finding.id, {
                                  severityTier: event.target.value as Finding["severityTier"],
                                })
                              }
                              className="h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-[var(--ring)]"
                            >
                              <option value="T1">T1</option>
                              <option value="T2">T2</option>
                              <option value="T3">T3</option>
                            </select>
                          </FormField>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {activeConfig.fields.map(renderField)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Output review</CardTitle>
              <CardDescription>
                Generate the editable plan draft and assessment report from current
                audit content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    const nextPlan = generatePlan(audit.id);
                    setGeneratedPlan(nextPlan);
                  }}
                >
                  Generate plan draft
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    const nextReport = generateReport(audit.id);
                    setReportPreview(nextReport);
                  }}
                >
                  Generate report preview
                </Button>
                {reportPreview && generatedPlan ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      downloadReportPdf({
                        title: reportPreview.report.title,
                        subtitle: `${client.name} • ${site.name}`,
                        sections: reportPreview.sections,
                        plan: generatedPlan,
                      });
                    }}
                  >
                    Export PDF
                  </Button>
                ) : null}
              </div>

              {generatedPlan ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    Plan draft
                  </p>
                  <div className="mt-4 grid gap-4">
                    {generatedPlan.sections.slice(0, 4).map((section) => (
                      <div key={section.title}>
                        <p className="font-medium text-slate-900">{section.title}</p>
                        <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
                          {section.body.map((line) => (
                            <li key={line}>• {line}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {reportPreview ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    Report preview
                  </p>
                  <div className="mt-4 space-y-4">
                    {reportPreview.sections.map((section) => (
                      <div key={section.title}>
                        <p className="font-medium text-slate-900">{section.title}</p>
                        <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
                          {section.body.slice(0, 5).map((line) => (
                            <li key={line}>• {line}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {!generatedPlan && !reportPreview ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  Generate outputs when you are ready to review the executive
                  summary, grouped findings, and draft water management plan.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Assistive findings</CardTitle>
                <Button
                  size="sm"
                  onClick={() =>
                    setDraftFinding({
                      category: activeConfig.title,
                      severityTier: "T3",
                      title: "",
                      description: "",
                      evidence: "",
                      recommendation: "",
                      idealState: "",
                      actualState: "",
                      riskExplanation: "",
                      linkedSectionKey: activeSection,
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add finding
                </Button>
              </div>
              <CardDescription>
                {activeFindingCount} findings linked to this section. Convert rule
                hits into managed findings or create your own.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeRules.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No threshold-based rules triggered for this section yet.
                </div>
              ) : (
                activeRules.map((rule) => (
                  <div key={rule.ruleId} className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{rule.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {rule.triggerReason}
                        </p>
                      </div>
                      <Badge tone="danger">{rule.suggestedSeverityTier}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      Ideal: {rule.idealState}
                      <br />
                      Actual: {rule.actualState}
                    </p>
                    <Button
                      className="mt-4 w-full"
                      variant="outline"
                      onClick={() => handleConvertRuleToFinding(rule.ruleId)}
                    >
                      Promote to finding
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent photos</CardTitle>
              <CardDescription>
                Attach evidence inside the audit context and include selected images
                in the appendix.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-600">
                <Camera className="h-4 w-4" />
                Upload photo for this section
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handlePhotoUpload(event, activeSection)}
                />
              </label>
              <div className="space-y-3">
                {scopedPhotos.slice(0, 4).map((photo) => (
                  <div key={photo.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.dataUrl}
                      alt={photo.caption}
                      className="h-32 w-full rounded-xl object-cover"
                    />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{photo.caption}</p>
                        <p className="text-xs text-slate-500">
                          {auditSectionLookup[photo.sectionKey].title}
                        </p>
                      </div>
                      {photo.includeInAppendix ? <Badge>Appendix</Badge> : null}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Save state</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>{saveState}</p>
              <p>{auditFindings.length} findings in this audit.</p>
              <p>{scopedPhotos.length} photos attached.</p>
              <p>
                Latest report:{" "}
                {reports.find((report) => report.auditId === audit.id)?.title ??
                  "Not generated yet"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {draftFinding ? (
        <FindingDrawer
          finding={draftFinding}
          onClose={() => setDraftFinding(null)}
          onSubmit={(payload) => {
            addFinding({
              auditId: audit.id,
              siteId: site.id,
              category: payload.category,
              severityTier: payload.severityTier,
              title: payload.title,
              location: site.name,
              linkedSectionKey: payload.linkedSectionKey,
              description: payload.description,
              evidence: payload.evidence,
              recommendation: payload.recommendation,
              idealState: payload.idealState,
              actualState: payload.actualState,
              riskExplanation: payload.riskExplanation,
              dueTimeframeDays:
                payload.severityTier === "T1"
                  ? 1
                  : payload.severityTier === "T2"
                    ? 30
                    : 90,
              status: "open",
            });
            setDraftFinding(null);
          }}
        />
      ) : null}
    </div>
  );
}

function FindingDrawer({
  finding,
  onClose,
  onSubmit,
}: {
  finding: Partial<Finding>;
  onClose: () => void;
  onSubmit: (payload: {
    category: string;
    severityTier: Finding["severityTier"];
    title: string;
    description: string;
    evidence: string;
    recommendation: string;
    idealState: string;
    actualState: string;
    riskExplanation: string;
    linkedSectionKey: Finding["linkedSectionKey"];
  }) => void;
}) {
  const [state, setState] = React.useState({
    category: finding.category ?? "General",
    severityTier: finding.severityTier ?? ("T3" as Finding["severityTier"]),
    title: finding.title ?? "",
    description: finding.description ?? "",
    evidence: finding.evidence ?? "",
    recommendation: finding.recommendation ?? "",
    idealState: finding.idealState ?? "",
    actualState: finding.actualState ?? "",
    riskExplanation: finding.riskExplanation ?? "",
    linkedSectionKey:
      finding.linkedSectionKey ?? ("distribution" as Finding["linkedSectionKey"]),
  });

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30 backdrop-blur-sm">
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Finding
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              Add or refine finding
            </h3>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="grid gap-4">
          <FormField label="Title">
            <Input
              value={state.title}
              onChange={(event) =>
                setState((current) => ({ ...current, title: event.target.value }))
              }
            />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Category">
              <Input
                value={state.category}
                onChange={(event) =>
                  setState((current) => ({ ...current, category: event.target.value }))
                }
              />
            </FormField>
            <FormField label="Severity">
              <select
                value={state.severityTier}
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    severityTier: event.target.value as Finding["severityTier"],
                  }))
                }
                className="h-11 rounded-xl border border-input bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-[var(--ring)]"
              >
                <option value="T1">T1</option>
                <option value="T2">T2</option>
                <option value="T3">T3</option>
              </select>
            </FormField>
          </div>
          <FormField label="Ideal state">
            <Textarea
              value={state.idealState}
              onChange={(event) =>
                setState((current) => ({ ...current, idealState: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Actual state">
            <Textarea
              value={state.actualState}
              onChange={(event) =>
                setState((current) => ({ ...current, actualState: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Risk explanation">
            <Textarea
              value={state.riskExplanation}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  riskExplanation: event.target.value,
                }))
              }
            />
          </FormField>
          <FormField label="Description">
            <Textarea
              value={state.description}
              onChange={(event) =>
                setState((current) => ({ ...current, description: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Evidence observed">
            <Textarea
              value={state.evidence}
              onChange={(event) =>
                setState((current) => ({ ...current, evidence: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Recommendation">
            <Textarea
              value={state.recommendation}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  recommendation: event.target.value,
                }))
              }
            />
          </FormField>
          <Button
            onClick={() => {
              onSubmit(state);
            }}
          >
            Save finding
          </Button>
        </div>
      </div>
    </div>
  );
}
