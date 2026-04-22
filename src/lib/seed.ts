import {
  type AppState,
  type Audit,
  type AuditSection,
  type AuditSectionKey,
  type Client,
  type Finding,
  type Photo,
  type PlanDraft,
  type ReportRecord,
  type Site,
} from "@/lib/types";

const now = "2026-04-21T12:00:00.000Z";

function createSection(
  key: AuditSectionKey,
  response: AuditSection["response"],
  status: AuditSection["status"] = "completed",
): AuditSection {
  return {
    key,
    status,
    notes: "",
    response,
    updatedAt: now,
  };
}

const client: Client = {
  id: "client_stmary",
  name: "St. Mary Regional Medical Center",
  contact: "Dana Whitlock",
  email: "dana.whitlock@stmaryregional.org",
  phone: "(555) 830-1192",
  address: "2900 West Main Street, Columbus, OH",
  facilityType: "Regional hospital",
  populationRiskLevel: "high",
  notes:
    "Sterile processing expansion underway. Facilities team requested a field-ready audit workflow before the next accreditation prep cycle.",
  createdAt: now,
  updatedAt: now,
};

const site: Site = {
  id: "site_north_tower",
  clientId: client.id,
  name: "North Tower Campus",
  facilityType: "Acute care hospital",
  address: "2900 West Main Street, Columbus, OH",
  notes:
    "Includes SPD, ICU, and rehab tower. Construction recently completed on the west patient wing.",
  sourceWaterType: "municipal",
  pretreatmentSummary: "Multistage filtration, softening, central RO to SPD.",
  criticalWaterPresent: true,
  steamPresent: true,
  hotWaterTempC: 58,
  returnTempC: 51,
  coldWaterTempC: 22,
  disinfectantResidualMgL: 0.15,
  deadLegsPresent: true,
  recirculationStatus: "Return loop underperforming on west wing",
  populationRiskLevel: "high",
  createdAt: now,
  updatedAt: now,
};

const audit: Audit = {
  id: "audit_north_tower_001",
  clientId: client.id,
  siteId: site.id,
  status: "in_progress",
  assessorName: "Avery Collins",
  assessmentDate: "2026-04-21",
  summary:
    "Initial field walkthrough completed with facilities and SPD leadership; several thermal control and documentation gaps identified.",
  sectionOrder: [
    "facility_overview",
    "source_water",
    "pretreatment",
    "distribution",
    "critical_water_use",
    "steam",
    "equipment_alignment",
    "monitoring_documentation",
    "findings",
    "plan_inputs",
  ],
  sections: {
    facility_overview: createSection("facility_overview", {
      assessmentDate: "2026-04-21",
      assessorName: "Avery Collins",
      facilityType: "Acute care hospital",
      departmentsServed: "ICU, SPD, dialysis clinic, patient towers",
      primaryContactsPresent: "Facilities director, infection prevention, SPD manager",
      populationRiskLevel: "high",
      generalNotes:
        "Hospital has several immunocompromised populations and active construction transition areas.",
    }),
    source_water: createSection("source_water", {
      sourceType: "municipal",
      entryPointNotes:
        "Single municipal entry with campus-level treatment and booster pressure controls.",
      knownSourceConcerns:
        "Residual variability noted after nearby city utility work.",
      observations:
        "Backflow isolation appears present but contractor turnover created documentation gaps.",
    }),
    pretreatment: createSection("pretreatment", {
      filtrationPresent: true,
      softenerPresent: true,
      carbonPresent: true,
      roPresent: true,
      diPresent: false,
      maintenanceVisibility: "Partial",
      serviceRecordsAvailable: true,
      observations:
        "Central RO to SPD is active, but filter change history was incomplete for west wing branches.",
    }),
    distribution: createSection("distribution", {
      waterPathSummary:
        "Central plant to north tower risers, return loop across west patient wing and SPD.",
      areasServed: "SPD, rehab, ICU, inpatient rooms, kitchen, ice machines.",
      distalPointsIdentified:
        "ICU shower cluster, west wing sink bank, SPD final rinse point.",
      deadLegPresent: true,
      noFlushingProgram: true,
      samplingPointNotes:
        "POE, heater outlet, return loop, distal ICU shower, SPD rinse.",
      hotWaterOutletTempC: 58,
      returnTempC: 51,
      coldWaterTempC: 22,
    }),
    critical_water_use: createSection("critical_water_use", {
      equipmentUsingCriticalWater: "SPD washers, cart washer, lab analyzers",
      finalRinseUsage: "Washer-disinfectors and instrument rinse",
      knownWaterTypeRequirements:
        "Critical final rinse should use very low conductivity water",
      mismatchConcerns:
        "One older washer appears tied to softened water during maintenance bypasses.",
      spdConductivityUsCm: 0.18,
      observations:
        "Conductivity target is not consistently met at the recorded point.",
    }),
    steam: createSection("steam", {
      steamSourceType: "Plant steam with terminal filtration",
      steamFilterPresent: true,
      condensateSamplingProcess: "On-demand after maintenance; no formal trending",
      visibleIssue: "Occasional dark residue at one sterilizer load",
      observations: "Team reports intermittent black specks after service events.",
    }),
    equipment_alignment: createSection("equipment_alignment", {
      entries: [
        {
          id: "eq_1",
          equipmentName: "Washer Disinfector 1",
          manufacturer: "Steris",
          model: "Reliance 777",
          requiredWaterType: "RO",
          currentWaterType: "Softened",
          aligned: false,
          comments: "Bypass observed during recent maintenance cycle.",
        },
        {
          id: "eq_2",
          equipmentName: "Lab Analyzer Bank",
          manufacturer: "Beckman Coulter",
          model: "AU680",
          requiredWaterType: "Filtered municipal",
          currentWaterType: "Filtered municipal",
          aligned: true,
          comments: "No observed mismatch.",
        },
      ],
    }),
    monitoring_documentation: createSection("monitoring_documentation", {
      chlorineResidualMgL: 0.15,
      currentTestingPractices:
        "Daily outlet temperatures, monthly chlorine checks, ad hoc Legionella cultures",
      monitoringSchedule: "Monthly to quarterly depending on area",
      logsAvailable: false,
      trendReviewAvailable: false,
      hasWmp: false,
      legionellaPositivityPercent: 32,
      legionellaHighRiskAreaCfuMl: 1.2,
      aerosolDevices: ["showers", "ice_machines", "humidifiers"],
      gapsObserved:
        "No consolidated trend package for current year; missing formal WMP ownership.",
    }),
    findings: createSection("findings", {}, "in_progress"),
    plan_inputs: createSection(
      "plan_inputs",
      {
        responsibleRoles:
          "Facilities director, infection prevention, SPD manager, contracted water treatment vendor",
        reviewCadence: "Monthly operations review, quarterly WMP review",
        testingCadence: "Residual weekly, temperature daily, Legionella quarterly",
        escalationLogic:
          "Thermal failures notify facilities and infection prevention same day; positive cultures escalate to executive safety team.",
        actionThresholdNotes:
          "Any T1 finding or positive high-risk area result triggers immediate same-day response planning.",
        documentationOwner: "Facilities director",
        documentationPlan:
          "Centralized shared drive with monthly review packet and corrective action log.",
      },
      "in_progress",
    ),
  },
  createdAt: now,
  updatedAt: now,
};

const finding: Finding = {
  id: "finding_1",
  auditId: audit.id,
  siteId: site.id,
  category: "Distribution",
  severityTier: "T1",
  title: "Return loop under target in west wing",
  location: "North tower west wing",
  linkedSectionKey: "distribution",
  description:
    "Return temperatures were below the expected control threshold in the west wing loop.",
  evidence: "Recorded return loop temperature was 51°C during walkthrough.",
  recommendation:
    "Verify balancing and recirculation performance, then confirm recovery with repeat temperature checks.",
  idealState: "Return loop should be maintained at or above 55°C.",
  actualState: "Return loop recorded at 51°C.",
  riskExplanation:
    "Substandard return temperatures support amplification within the recirculated loop and weaken thermal control in distal areas.",
  owner: "Facilities",
  dueTimeframeDays: 7,
  status: "open",
  createdAt: now,
  updatedAt: now,
};

const photo: Photo = {
  id: "photo_1",
  clientId: client.id,
  siteId: site.id,
  auditId: audit.id,
  sectionKey: "distribution",
  caption: "West wing balancing valve cluster",
  includeInAppendix: true,
  dataUrl:
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 420'><rect width='640' height='420' rx='28' fill='%23dbeaf0'/><rect x='36' y='36' width='568' height='348' rx='22' fill='%23125c73'/><circle cx='164' cy='218' r='68' fill='%23f59e0b' opacity='0.85'/><rect x='254' y='118' width='224' height='32' rx='16' fill='%23effcf8' opacity='0.95'/><rect x='254' y='176' width='160' height='24' rx='12' fill='%23effcf8' opacity='0.8'/><rect x='254' y='224' width='254' height='24' rx='12' fill='%23effcf8' opacity='0.8'/><rect x='254' y='272' width='180' height='24' rx='12' fill='%23effcf8' opacity='0.8'/></svg>",
  createdAt: now,
};

const plan: PlanDraft = {
  id: "plan_seed",
  auditId: audit.id,
  clientId: client.id,
  siteId: site.id,
  version: 1,
  generatedAt: now,
  updatedAt: now,
  sections: [
    {
      title: "System Overview",
      body: [
        "Draft water management plan seeded for demonstration purposes.",
        "Use Generate Plan from the audit workspace to refresh from current data.",
      ],
    },
  ],
};

const report: ReportRecord = {
  id: "report_seed",
  auditId: audit.id,
  clientId: client.id,
  siteId: site.id,
  reportType: "assessment",
  version: 1,
  title: "St. Mary Regional Medical Center - North Tower Campus Water Assessment",
  generatedAt: now,
  summary:
    "Seed report available for preview. Generate again after updating audit content.",
};

export const seedState: AppState = {
  session: {
    email: "avery@clarix.demo",
    name: "Avery Collins",
  },
  clients: [client],
  sites: [site],
  audits: [audit],
  findings: [finding],
  photos: [photo],
  plans: [plan],
  reports: [report],
};
