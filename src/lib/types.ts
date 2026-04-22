export type SeverityTier = "T1" | "T2" | "T3";
export type FindingStatus = "open" | "reviewed" | "closed";
export type AuditStatus = "draft" | "in_progress" | "completed";
export type SectionStatus = "not_started" | "in_progress" | "completed";
export type PopulationRiskLevel = "standard" | "elevated" | "high";

export type AuditSectionKey =
  | "facility_overview"
  | "source_water"
  | "pretreatment"
  | "distribution"
  | "critical_water_use"
  | "steam"
  | "equipment_alignment"
  | "monitoring_documentation"
  | "findings"
  | "plan_inputs";

export type Client = {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  facilityType: string;
  populationRiskLevel: PopulationRiskLevel;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type Site = {
  id: string;
  clientId: string;
  name: string;
  facilityType: string;
  address: string;
  notes: string;
  sourceWaterType: string;
  pretreatmentSummary: string;
  criticalWaterPresent: boolean;
  steamPresent: boolean;
  hotWaterTempC?: number;
  returnTempC?: number;
  coldWaterTempC?: number;
  disinfectantResidualMgL?: number;
  deadLegsPresent: boolean;
  recirculationStatus: string;
  populationRiskLevel: PopulationRiskLevel;
  createdAt: string;
  updatedAt: string;
};

export type EquipmentAlignmentEntry = {
  id: string;
  equipmentName: string;
  manufacturer: string;
  model: string;
  requiredWaterType: string;
  currentWaterType: string;
  aligned: boolean;
  comments: string;
};

export type AuditSectionResponse = Record<string, unknown>;

export type AuditSection = {
  key: AuditSectionKey;
  status: SectionStatus;
  notes: string;
  response: AuditSectionResponse;
  updatedAt: string;
};

export type Audit = {
  id: string;
  clientId: string;
  siteId: string;
  status: AuditStatus;
  assessorName: string;
  assessmentDate: string;
  summary: string;
  sectionOrder: AuditSectionKey[];
  sections: Record<AuditSectionKey, AuditSection>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type Finding = {
  id: string;
  auditId: string;
  siteId: string;
  category: string;
  severityTier: SeverityTier;
  title: string;
  location: string;
  linkedSectionKey: AuditSectionKey;
  description: string;
  evidence: string;
  recommendation: string;
  idealState: string;
  actualState: string;
  riskExplanation: string;
  owner?: string;
  dueTimeframeDays?: number;
  status: FindingStatus;
  createdAt: string;
  updatedAt: string;
};

export type Photo = {
  id: string;
  clientId: string;
  siteId: string;
  auditId: string;
  sectionKey: AuditSectionKey;
  findingId?: string;
  caption: string;
  includeInAppendix: boolean;
  dataUrl: string;
  createdAt: string;
};

export type PlanSection = {
  title: string;
  body: string[];
};

export type PlanDraft = {
  id: string;
  auditId: string;
  clientId: string;
  siteId: string;
  version: number;
  sections: PlanSection[];
  generatedAt: string;
  updatedAt: string;
};

export type ReportSection = {
  title: string;
  body: string[];
};

export type ReportRecord = {
  id: string;
  auditId: string;
  clientId: string;
  siteId: string;
  reportType: "assessment";
  version: number;
  title: string;
  generatedAt: string;
  summary: string;
};

export type RiskRuleResult = {
  ruleId: string;
  sectionKey: AuditSectionKey;
  triggered: boolean;
  title: string;
  triggerReason: string;
  suggestedSeverityTier: SeverityTier;
  idealState: string;
  actualState: string;
  riskExplanation: string;
  recommendedActionWindow: string;
  category: string;
};

export type UserSession = {
  email: string;
  name: string;
};

export type AppState = {
  session: UserSession | null;
  clients: Client[];
  sites: Site[];
  audits: Audit[];
  findings: Finding[];
  photos: Photo[];
  plans: PlanDraft[];
  reports: ReportRecord[];
};
