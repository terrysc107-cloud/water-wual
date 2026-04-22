import { z } from "zod";
import { type AuditSectionKey } from "@/lib/types";

export type AuditFieldOption = {
  label: string;
  value: string;
};

export type AuditFieldConfig = {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "date"
    | "select"
    | "checkbox"
    | "multi-select";
  placeholder?: string;
  description?: string;
  options?: AuditFieldOption[];
};

export type AuditSectionConfig = {
  key: AuditSectionKey;
  title: string;
  description: string;
  completionDescription: string;
  fields: AuditFieldConfig[];
  schema: z.ZodType;
};

const riskPopulationOptions = [
  { label: "Standard", value: "standard" },
  { label: "Elevated", value: "elevated" },
  { label: "High", value: "high" },
];

export const auditSectionConfig: AuditSectionConfig[] = [
  {
    key: "facility_overview",
    title: "Facility Overview",
    description: "Establish the site context, team on site, and population risk profile.",
    completionDescription: "Assessment date, assessor, and facility profile recorded.",
    schema: z.object({
      assessmentDate: z.string().optional(),
      assessorName: z.string().optional(),
      facilityType: z.string().optional(),
      departmentsServed: z.string().optional(),
      primaryContactsPresent: z.string().optional(),
      populationRiskLevel: z.string().optional(),
      generalNotes: z.string().optional(),
    }),
    fields: [
      { name: "assessmentDate", label: "Assessment date", type: "date" },
      { name: "assessorName", label: "Assessor name", type: "text", placeholder: "Lead assessor" },
      { name: "facilityType", label: "Facility type", type: "text", placeholder: "Acute care hospital" },
      {
        name: "departmentsServed",
        label: "Departments served",
        type: "textarea",
        placeholder: "ICU, SPD, dialysis, patient towers...",
      },
      {
        name: "primaryContactsPresent",
        label: "Primary contacts present",
        type: "textarea",
        placeholder: "Infection prevention, facilities, sterile processing...",
      },
      {
        name: "populationRiskLevel",
        label: "Population risk level",
        type: "select",
        options: riskPopulationOptions,
      },
      {
        name: "generalNotes",
        label: "General notes",
        type: "textarea",
        placeholder: "Current constraints, ongoing construction, and known water issues.",
      },
    ],
  },
  {
    key: "source_water",
    title: "Source Water",
    description: "Document source entry, incoming treatment, and source concerns.",
    completionDescription: "Source type, entry notes, and source concerns recorded.",
    schema: z.object({
      sourceType: z.string().optional(),
      entryPointNotes: z.string().optional(),
      knownSourceConcerns: z.string().optional(),
      observations: z.string().optional(),
    }),
    fields: [
      {
        name: "sourceType",
        label: "Source type",
        type: "select",
        options: [
          { label: "Municipal", value: "municipal" },
          { label: "Well", value: "well" },
          { label: "Mixed", value: "mixed" },
          { label: "Other", value: "other" },
        ],
      },
      {
        name: "entryPointNotes",
        label: "Entry point notes",
        type: "textarea",
        placeholder: "How the site receives and conditions incoming water.",
      },
      {
        name: "knownSourceConcerns",
        label: "Known source concerns",
        type: "textarea",
        placeholder: "Residual variability, construction nearby, backflow concerns.",
      },
      {
        name: "observations",
        label: "Observations",
        type: "textarea",
        placeholder: "Visible quality issues or source reliability notes.",
      },
    ],
  },
  {
    key: "pretreatment",
    title: "Pretreatment Systems",
    description: "Capture installed pretreatment equipment and maintenance visibility.",
    completionDescription: "Pretreatment presence and maintenance visibility recorded.",
    schema: z.object({
      filtrationPresent: z.boolean().optional(),
      softenerPresent: z.boolean().optional(),
      carbonPresent: z.boolean().optional(),
      roPresent: z.boolean().optional(),
      diPresent: z.boolean().optional(),
      maintenanceVisibility: z.string().optional(),
      serviceRecordsAvailable: z.boolean().optional(),
      observations: z.string().optional(),
    }),
    fields: [
      { name: "filtrationPresent", label: "Filtration present", type: "checkbox" },
      { name: "softenerPresent", label: "Softener present", type: "checkbox" },
      { name: "carbonPresent", label: "Carbon present", type: "checkbox" },
      { name: "roPresent", label: "RO present", type: "checkbox" },
      { name: "diPresent", label: "DI present", type: "checkbox" },
      {
        name: "maintenanceVisibility",
        label: "Maintenance visibility",
        type: "text",
        placeholder: "Clear, partial, or unclear",
      },
      { name: "serviceRecordsAvailable", label: "Service records available", type: "checkbox" },
      {
        name: "observations",
        label: "Observations",
        type: "textarea",
        placeholder: "Filter changes, bypasses, alarms, and physical condition.",
      },
    ],
  },
  {
    key: "distribution",
    title: "Distribution System",
    description: "Map the water path and capture system temperatures and stagnation risk.",
    completionDescription: "Distribution path, critical points, and measurements recorded.",
    schema: z.object({
      waterPathSummary: z.string().optional(),
      areasServed: z.string().optional(),
      distalPointsIdentified: z.string().optional(),
      deadLegPresent: z.boolean().optional(),
      noFlushingProgram: z.boolean().optional(),
      samplingPointNotes: z.string().optional(),
      hotWaterOutletTempC: z.coerce.number().optional(),
      returnTempC: z.coerce.number().optional(),
      coldWaterTempC: z.coerce.number().optional(),
    }),
    fields: [
      {
        name: "waterPathSummary",
        label: "Water path summary",
        type: "textarea",
        placeholder: "Incoming source to points of use.",
      },
      {
        name: "areasServed",
        label: "Areas/equipment served",
        type: "textarea",
        placeholder: "Patient towers, SPD, kitchen, ice machines...",
      },
      {
        name: "distalPointsIdentified",
        label: "Distal points identified",
        type: "textarea",
        placeholder: "Document representative distal outlets and risk points.",
      },
      { name: "deadLegPresent", label: "Dead leg or stagnation concern present", type: "checkbox" },
      { name: "noFlushingProgram", label: "No flushing approach in place", type: "checkbox" },
      {
        name: "samplingPointNotes",
        label: "Sampling point notes",
        type: "textarea",
        placeholder: "POE, heater outlet, return loop, distal outlets.",
      },
      { name: "hotWaterOutletTempC", label: "Heater / outlet temp (°C)", type: "number" },
      { name: "returnTempC", label: "Return loop temp (°C)", type: "number" },
      { name: "coldWaterTempC", label: "Cold water temp (°C)", type: "number" },
    ],
  },
  {
    key: "critical_water_use",
    title: "Critical Water Use",
    description: "Capture the equipment and water quality requirements that cannot drift.",
    completionDescription: "Critical uses and required water quality expectations captured.",
    schema: z.object({
      equipmentUsingCriticalWater: z.string().optional(),
      finalRinseUsage: z.string().optional(),
      knownWaterTypeRequirements: z.string().optional(),
      mismatchConcerns: z.string().optional(),
      spdConductivityUsCm: z.coerce.number().optional(),
      observations: z.string().optional(),
    }),
    fields: [
      {
        name: "equipmentUsingCriticalWater",
        label: "Equipment using critical water",
        type: "textarea",
        placeholder: "Washers, sterilizers, lab analyzers...",
      },
      {
        name: "finalRinseUsage",
        label: "Final rinse usage",
        type: "textarea",
        placeholder: "What equipment relies on critical final rinse quality?",
      },
      {
        name: "knownWaterTypeRequirements",
        label: "Known water type requirements",
        type: "textarea",
        placeholder: "RO, DI, filtered steam condensate, conductivity targets.",
      },
      {
        name: "mismatchConcerns",
        label: "Mismatch concerns",
        type: "textarea",
        placeholder: "Where current supply may not meet requirement.",
      },
      { name: "spdConductivityUsCm", label: "SPD conductivity (µS/cm)", type: "number" },
      { name: "observations", label: "Observations", type: "textarea", placeholder: "Device-facing quality concerns." },
    ],
  },
  {
    key: "steam",
    title: "Steam System",
    description: "Document steam quality controls and visible steam-related issues.",
    completionDescription: "Steam source, filtration, and observations captured.",
    schema: z.object({
      steamSourceType: z.string().optional(),
      steamFilterPresent: z.boolean().optional(),
      condensateSamplingProcess: z.string().optional(),
      visibleIssue: z.string().optional(),
      observations: z.string().optional(),
    }),
    fields: [
      {
        name: "steamSourceType",
        label: "Steam source type",
        type: "text",
        placeholder: "Plant steam, clean steam, or mixed.",
      },
      { name: "steamFilterPresent", label: "Steam filter present", type: "checkbox" },
      {
        name: "condensateSamplingProcess",
        label: "Condensate sampling process",
        type: "textarea",
        placeholder: "How condensate is checked and trended.",
      },
      {
        name: "visibleIssue",
        label: "Visible residue or black specks",
        type: "text",
        placeholder: "Describe visible steam quality issues.",
      },
      { name: "observations", label: "Observations", type: "textarea", placeholder: "Steam system observations." },
    ],
  },
  {
    key: "equipment_alignment",
    title: "Equipment Alignment",
    description: "Track repeated equipment entries and whether supply matches requirements.",
    completionDescription: "Key equipment alignment entries added.",
    schema: z.object({
      entries: z.array(
        z.object({
          id: z.string(),
          equipmentName: z.string(),
          manufacturer: z.string(),
          model: z.string(),
          requiredWaterType: z.string(),
          currentWaterType: z.string(),
          aligned: z.boolean(),
          comments: z.string(),
        }),
      ),
    }),
    fields: [],
  },
  {
    key: "monitoring_documentation",
    title: "Monitoring & Documentation",
    description: "Record monitoring cadence, documentation, and residual/testing evidence.",
    completionDescription: "Monitoring, documentation, and water quality readings recorded.",
    schema: z.object({
      chlorineResidualMgL: z.coerce.number().optional(),
      currentTestingPractices: z.string().optional(),
      monitoringSchedule: z.string().optional(),
      logsAvailable: z.boolean().optional(),
      trendReviewAvailable: z.boolean().optional(),
      hasWmp: z.boolean().optional(),
      legionellaPositivityPercent: z.coerce.number().optional(),
      legionellaHighRiskAreaCfuMl: z.coerce.number().optional(),
      aerosolDevices: z.array(z.string()).optional(),
      gapsObserved: z.string().optional(),
    }),
    fields: [
      { name: "chlorineResidualMgL", label: "Chlorine residual (mg/L)", type: "number" },
      {
        name: "currentTestingPractices",
        label: "Current testing practices",
        type: "textarea",
        placeholder: "Monthly residual checks, quarterly cultures, daily temps...",
      },
      {
        name: "monitoringSchedule",
        label: "Monitoring schedule",
        type: "text",
        placeholder: "Monthly, quarterly, annual, event-triggered.",
      },
      { name: "logsAvailable", label: "Logs / documentation available", type: "checkbox" },
      { name: "trendReviewAvailable", label: "Trend review available", type: "checkbox" },
      { name: "hasWmp", label: "Water management plan in place", type: "checkbox" },
      { name: "legionellaPositivityPercent", label: "Legionella positivity (%)", type: "number" },
      { name: "legionellaHighRiskAreaCfuMl", label: "High-risk area Legionella CFU/mL", type: "number" },
      {
        name: "aerosolDevices",
        label: "Aerosol-generating devices",
        type: "multi-select",
        options: [
          { label: "Showers", value: "showers" },
          { label: "Cooling towers", value: "cooling_towers" },
          { label: "Ice machines", value: "ice_machines" },
          { label: "Humidifiers", value: "humidifiers" },
        ],
      },
      { name: "gapsObserved", label: "Documentation gaps observed", type: "textarea" },
    ],
  },
  {
    key: "findings",
    title: "Findings",
    description: "Review manually created findings and rule-backed suggestions.",
    completionDescription: "Findings curated and ready for outputs.",
    schema: z.object({}),
    fields: [],
  },
  {
    key: "plan_inputs",
    title: "Plan Inputs",
    description: "Capture ownership, cadence, escalation, and documentation expectations.",
    completionDescription: "Operational plan inputs captured for draft generation.",
    schema: z.object({
      responsibleRoles: z.string().optional(),
      reviewCadence: z.string().optional(),
      testingCadence: z.string().optional(),
      escalationLogic: z.string().optional(),
      actionThresholdNotes: z.string().optional(),
      documentationOwner: z.string().optional(),
      documentationPlan: z.string().optional(),
    }),
    fields: [
      {
        name: "responsibleRoles",
        label: "Responsible roles",
        type: "textarea",
        placeholder: "Facilities, infection prevention, SPD leadership, contractor partners.",
      },
      {
        name: "reviewCadence",
        label: "Review cadence",
        type: "text",
        placeholder: "Quarterly WMP review, monthly operational review.",
      },
      {
        name: "testingCadence",
        label: "Testing cadence",
        type: "text",
        placeholder: "Residual daily, temperatures weekly, Legionella quarterly.",
      },
      {
        name: "escalationLogic",
        label: "Escalation logic",
        type: "textarea",
        placeholder: "Who is notified and what action is triggered when thresholds fail.",
      },
      {
        name: "actionThresholdNotes",
        label: "Action threshold notes",
        type: "textarea",
        placeholder: "Critical thresholds, high-risk areas, and shutdown triggers.",
      },
      {
        name: "documentationOwner",
        label: "Documentation owner",
        type: "text",
        placeholder: "Role accountable for logs, updates, and records.",
      },
      {
        name: "documentationPlan",
        label: "Documentation plan",
        type: "textarea",
        placeholder: "Storage, review, and version-control expectations.",
      },
    ],
  },
];

export const auditSectionLookup = Object.fromEntries(
  auditSectionConfig.map((section) => [section.key, section]),
) as Record<AuditSectionKey, AuditSectionConfig>;
