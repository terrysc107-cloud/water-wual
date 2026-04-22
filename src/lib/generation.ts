import {
  type Audit,
  type Client,
  type Finding,
  type Photo,
  type PlanDraft,
  type PlanSection,
  type ReportRecord,
  type ReportSection,
  type RiskRuleResult,
  type Site,
} from "@/lib/types";
import { createId, formatDate, formatMeasurement } from "@/lib/utils";

export function buildPlanDraft(input: {
  audit: Audit;
  client: Client;
  site: Site;
  findings: Finding[];
  rules: RiskRuleResult[];
}): PlanDraft {
  const { audit, client, site, findings, rules } = input;
  const distribution = audit.sections.distribution.response;
  const monitoring = audit.sections.monitoring_documentation.response;
  const planInputs = audit.sections.plan_inputs.response;
  const critical = audit.sections.critical_water_use.response;

  const sections: PlanSection[] = [
    {
      title: "System Overview",
      body: [
        `${client.name} / ${site.name} was assessed on ${formatDate(audit.assessmentDate)} by ${audit.assessorName || "the Clarix assessor"}.`,
        `Facility type: ${site.facilityType}. Source water: ${site.sourceWaterType}. Recirculation status: ${site.recirculationStatus || "Not documented"}.`,
        `Critical water present: ${site.criticalWaterPresent ? "Yes" : "No"}. Steam present: ${site.steamPresent ? "Yes" : "No"}.`,
      ],
    },
    {
      title: "Hazard Analysis",
      body: [
        "Clarix evaluates risk using the defensible sequence Standard -> Observation -> Gap -> Risk -> Action.",
        `Current triggered risk conditions: ${rules.length > 0 ? rules.map((rule) => rule.title).join("; ") : "No threshold-based risk conditions triggered from the recorded data."}`,
        `High-risk population profile: ${site.populationRiskLevel}.`,
      ],
    },
    {
      title: "Control Measures",
      body: [
        "Prioritize elimination, substitution, engineering controls, maintenance, monitoring, and response in that order.",
        `Thermal control targets: heater >= 60°C, return >= 55°C, cold <= 20°C. Current readings: ${formatMeasurement(Number(distribution.hotWaterOutletTempC), "°C")}, ${formatMeasurement(Number(distribution.returnTempC), "°C")}, ${formatMeasurement(Number(distribution.coldWaterTempC), "°C")}.`,
        `Critical water expectations: ${String(critical.knownWaterTypeRequirements || "Document required water type at the point of use and verify equipment alignment.")}`,
      ],
    },
    {
      title: "Monitoring Plan",
      body: [
        `Monitoring schedule: ${String(monitoring.monitoringSchedule || planInputs.testingCadence || "Define a monthly-to-yearly monitoring cadence by system and risk area.")}`,
        `Key points: POE, heater outlet, return loop, distal outlets, and aerosol-generating devices.`,
        `Verification checks should include residuals, temperature control points, and any site-specific testing described in current practice: ${String(monitoring.currentTestingPractices || "Not yet defined")}.`,
      ],
    },
    {
      title: "Verification Procedures",
      body: [
        "Testing is verification, not control. Verification confirms whether control measures remain effective.",
        `Residual floor: ${formatMeasurement(Number(monitoring.chlorineResidualMgL), " mg/L", "Not recorded")}.`,
        "Use pre-flush and post-flush sampling strategically to distinguish risk indication from system quality.",
      ],
    },
    {
      title: "Validation Procedures",
      body: [
        "Validation should confirm that the full water management approach reduces risk in the actual facility context.",
        `Trend review availability: ${monitoring.trendReviewAvailable ? "Available" : "Not available"}.`,
        `Legionella results entered: positivity ${formatMeasurement(Number(monitoring.legionellaPositivityPercent), "%", "Not recorded")}; high-risk area ${formatMeasurement(Number(monitoring.legionellaHighRiskAreaCfuMl), " CFU/mL", "Not recorded")}.`,
      ],
    },
    {
      title: "Corrective Actions",
      body: findings.length
        ? findings
            .slice(0, 5)
            .map(
              (finding) =>
                `${finding.severityTier}: ${finding.title} -> ${finding.recommendation || "Define corrective action owner and completion window."}`,
            )
        : ["No findings have been promoted yet. Review triggered rules and convert material gaps into managed findings."],
    },
    {
      title: "Documentation Plan",
      body: [
        `Documentation owner: ${String(planInputs.documentationOwner || "Assign accountable role.")}`,
        `Documentation expectations: ${String(planInputs.documentationPlan || "Retain monitoring logs, corrective action records, and review notes in one controlled location.")}`,
        `Current WMP status: ${monitoring.hasWmp ? "Documented" : "Not documented / not confirmed"}.`,
      ],
    },
    {
      title: "Contingency Plan",
      body: [
        `Escalation path: ${String(planInputs.escalationLogic || "Define who is notified, what thresholds trigger escalation, and what interim controls are deployed.")}`,
        `Action thresholds: ${String(planInputs.actionThresholdNotes || "Document response thresholds for thermal failures, residual failures, and positive Legionella results.")}`,
        "High-risk areas should receive immediate review when thresholds fail or contamination indicators are present.",
      ],
    },
  ];

  const now = new Date().toISOString();

  return {
    id: createId("plan"),
    auditId: audit.id,
    clientId: client.id,
    siteId: site.id,
    version: 1,
    sections,
    generatedAt: now,
    updatedAt: now,
  };
}

export function buildAssessmentReport(input: {
  audit: Audit;
  client: Client;
  site: Site;
  findings: Finding[];
  photos: Photo[];
  plan: PlanDraft;
}): {
  report: ReportRecord;
  sections: ReportSection[];
} {
  const { audit, client, site, findings, photos, plan } = input;
  const executiveSummary = findings.length
    ? `${findings.filter((finding) => finding.severityTier === "T1").length} critical, ${findings.filter((finding) => finding.severityTier === "T2").length} significant, and ${findings.filter((finding) => finding.severityTier === "T3").length} advisable findings were documented.`
    : "No findings have been promoted yet; the report remains a structured draft pending consultant review.";

  const sections: ReportSection[] = [
    {
      title: "Executive Summary",
      body: [
        `${client.name} / ${site.name}`,
        executiveSummary,
        `Assessment performed ${formatDate(audit.assessmentDate)} by ${audit.assessorName || "Clarix assessor"}.`,
      ],
    },
    {
      title: "Scope & Methodology",
      body: [
        "This assessment follows the Clarix field-first audit structure spanning facility overview, source water, pretreatment, distribution, critical water use, steam, equipment alignment, monitoring/documentation, findings, and plan inputs.",
        "Risk logic is assistive and threshold-based; final consultant judgment remains manual.",
      ],
    },
    {
      title: "System Observations",
      body: [
        `Source water: ${site.sourceWaterType}`,
        `Pretreatment summary: ${site.pretreatmentSummary}`,
        `Recirculation status: ${site.recirculationStatus}`,
        `Population risk level: ${site.populationRiskLevel}`,
      ],
    },
    {
      title: "Findings by Severity",
      body: findings.length
        ? findings
            .sort((a, b) => a.severityTier.localeCompare(b.severityTier))
            .map(
              (finding) =>
                `${finding.severityTier} | ${finding.title} | Ideal: ${finding.idealState} | Actual: ${finding.actualState} | Action: ${finding.recommendation}`,
            )
        : ["No findings have been finalized yet."],
    },
    {
      title: "Water Management Plan",
      body: plan.sections.flatMap((section) => [
        `${section.title}:`,
        ...section.body.map((line) => `- ${line}`),
      ]),
    },
    {
      title: "Appendix",
      body: photos.length
        ? photos
            .filter((photo) => photo.includeInAppendix)
            .map((photo) => `${photo.caption || "Untitled photo"} (${formatDate(photo.createdAt)})`)
        : ["No appendix photos selected."],
    },
  ];

  return {
    report: {
      id: createId("report"),
      auditId: audit.id,
      clientId: client.id,
      siteId: site.id,
      reportType: "assessment",
      version: 1,
      title: `${client.name} - ${site.name} Water Assessment`,
      generatedAt: new Date().toISOString(),
      summary: executiveSummary,
    },
    sections,
  };
}
