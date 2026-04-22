import {
  type Audit,
  type AuditSectionKey,
  type RiskRuleResult,
  type Site,
} from "@/lib/types";

type SectionResponse = Record<string, unknown>;

function asNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
}

function asBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  return undefined;
}

function section(audit: Audit, key: AuditSectionKey): SectionResponse {
  return audit.sections[key]?.response ?? {};
}

function buildRule(
  ruleId: string,
  sectionKey: AuditSectionKey,
  title: string,
  category: string,
  suggestedSeverityTier: RiskRuleResult["suggestedSeverityTier"],
  triggerReason: string,
  idealState: string,
  actualState: string,
  riskExplanation: string,
  recommendedActionWindow: string,
): RiskRuleResult {
  return {
    ruleId,
    sectionKey,
    triggered: true,
    title,
    category,
    suggestedSeverityTier,
    triggerReason,
    idealState,
    actualState,
    riskExplanation,
    recommendedActionWindow,
  };
}

export function evaluateRiskRules(audit: Audit, site: Site): RiskRuleResult[] {
  const distribution = section(audit, "distribution");
  const criticalWater = section(audit, "critical_water_use");
  const monitoring = section(audit, "monitoring_documentation");
  const equipmentAlignment = section(audit, "equipment_alignment");
  const rules: RiskRuleResult[] = [];

  const hotWater = asNumber(distribution.hotWaterOutletTempC) ?? site.hotWaterTempC;
  const returnTemp = asNumber(distribution.returnTempC) ?? site.returnTempC;
  const coldWater = asNumber(distribution.coldWaterTempC) ?? site.coldWaterTempC;
  const chlorine =
    asNumber(monitoring.chlorineResidualMgL) ?? site.disinfectantResidualMgL;
  const deadLegPresent =
    asBoolean(distribution.deadLegPresent) ?? site.deadLegsPresent;
  const noFlushingProgram = asBoolean(distribution.noFlushingProgram);
  const hasWmp = asBoolean(monitoring.hasWmp);
  const logsAvailable = asBoolean(monitoring.logsAvailable);
  const legionellaPositivity = asNumber(monitoring.legionellaPositivityPercent);
  const legionellaHighRiskArea = asNumber(monitoring.legionellaHighRiskAreaCfuMl);
  const spdConductivity = asNumber(criticalWater.spdConductivityUsCm);

  if (hotWater !== undefined && hotWater < 60) {
    rules.push(
      buildRule(
        "hot-water-below-standard",
        "distribution",
        "Hot water outlet below 60°C",
        "Distribution",
        "T1",
        "Amplification risk triggered by outlet temperature below the expected thermal control point.",
        "Heater / outlet temperature should be at or above 60°C.",
        `Recorded outlet temperature was ${hotWater}°C.`,
        "Water in the growth zone increases amplification potential and weakens thermal control.",
        "Immediate",
      ),
    );
  }

  if (returnTemp !== undefined && returnTemp < 55) {
    rules.push(
      buildRule(
        "return-loop-below-standard",
        "distribution",
        "Return loop below 55°C",
        "Distribution",
        "T2",
        "Loop temperature indicates inadequate recirculation or heat maintenance.",
        "Return loop temperature should be at or above 55°C.",
        `Recorded return loop temperature was ${returnTemp}°C.`,
        "Low return temperatures suggest loop failure and allow amplification in recirculated water.",
        "Within 30 days",
      ),
    );
  }

  if (coldWater !== undefined && coldWater > 20) {
    rules.push(
      buildRule(
        "cold-water-above-standard",
        "distribution",
        "Cold water above 20°C",
        "Distribution",
        "T2",
        "Cold water measured in the amplification growth zone.",
        "Cold water should remain at or below 20°C.",
        `Recorded cold water temperature was ${coldWater}°C.`,
        "Warm cold water increases amplification potential and may indicate routing or stagnation problems.",
        "Within 30 days",
      ),
    );
  }

  if (chlorine !== undefined && chlorine < 0.2) {
    rules.push(
      buildRule(
        "chlorine-below-standard",
        "monitoring_documentation",
        "Disinfectant residual below 0.2 mg/L",
        "Source Water",
        "T2",
        "Incoming or distributed disinfectant residual is below the recommended floor.",
        "Residual disinfectant should remain at or above 0.2 mg/L.",
        `Recorded residual was ${chlorine} mg/L.`,
        "Low disinfectant residual increases contamination vulnerability at the source or within the system.",
        "Within 30 days",
      ),
    );
  }

  if (deadLegPresent && noFlushingProgram) {
    rules.push(
      buildRule(
        "dead-leg-without-flushing",
        "distribution",
        "Dead legs present without flushing control",
        "Distribution",
        "T1",
        "Stagnation concerns were identified without an operational flushing response.",
        "Dead legs should be eliminated or managed with documented flushing and follow-up.",
        "Dead leg / stagnation concern noted and no flushing program documented.",
        "Stagnant sections amplify biofilm and growth risk, especially when combined with temperature failures.",
        "Immediate",
      ),
    );
  }

  if (hasWmp === false) {
    rules.push(
      buildRule(
        "missing-wmp",
        "monitoring_documentation",
        "No water management plan documented",
        "Documentation",
        "T2",
        "Required documentation for system oversight is missing.",
        "A current water management plan should be documented and actively maintained.",
        "No current water management plan was documented during the audit.",
        "Without a current plan, control ownership and corrective actions are harder to defend and sustain.",
        "Within 30 days",
      ),
    );
  }

  if (logsAvailable === false) {
    rules.push(
      buildRule(
        "missing-testing-logs",
        "monitoring_documentation",
        "Testing records are unavailable",
        "Monitoring",
        "T2",
        "Verification evidence was not available for review.",
        "Monitoring logs and records should be available for trend review and verification.",
        "Current testing records were not available during the audit.",
        "Missing records make it difficult to verify control performance or respond confidently to failures.",
        "Within 30 days",
      ),
    );
  }

  const entries = Array.isArray(equipmentAlignment.entries)
    ? equipmentAlignment.entries
    : [];
  entries.forEach((entry, index) => {
    const current = typeof entry === "object" && entry ? entry : {};
    if (
      typeof current.requiredWaterType === "string" &&
      typeof current.currentWaterType === "string" &&
      current.requiredWaterType &&
      current.currentWaterType &&
      current.requiredWaterType !== current.currentWaterType
    ) {
      rules.push(
        buildRule(
          `equipment-mismatch-${index}`,
          "equipment_alignment",
          `Equipment water mismatch: ${String(current.equipmentName || "Unnamed equipment")}`,
          "Equipment Alignment",
          "T1",
          "Required water type does not match the current supplied water.",
          "Equipment should receive the required water quality specified by the manufacturer or process.",
          `Required ${current.requiredWaterType}, currently supplied ${current.currentWaterType}.`,
          "Water mismatch directly affects device performance, residue risk, and patient-facing process reliability.",
          "Immediate",
        ),
      );
    }
  });

  if (spdConductivity !== undefined && spdConductivity > 0.1) {
    rules.push(
      buildRule(
        "spd-conductivity-high",
        "critical_water_use",
        "SPD conductivity above 0.1 µS/cm",
        "Critical Water",
        "T1",
        "Critical rinse conductivity exceeds the preferred target for SPD use.",
        "SPD conductivity should be at or below 0.1 µS/cm.",
        `Recorded SPD conductivity was ${spdConductivity} µS/cm.`,
        "Out-of-spec final rinse quality can create direct device and process risk in sterile processing.",
        "Immediate",
      ),
    );
  }

  if (legionellaPositivity !== undefined && legionellaPositivity >= 30) {
    rules.push(
      buildRule(
        "legionella-positivity-high",
        "monitoring_documentation",
        "Legionella positivity at or above 30%",
        "Monitoring",
        "T1",
        "Laboratory positivity threshold indicates intervention is required.",
        "Legionella positivity should remain below intervention thresholds.",
        `Recorded positivity was ${legionellaPositivity}%.`,
        "High positivity suggests elevated colonization pressure and an urgent need for response.",
        "Immediate",
      ),
    );
  }

  if (legionellaHighRiskArea !== undefined && legionellaHighRiskArea >= 1) {
    rules.push(
      buildRule(
        "legionella-high-risk-cfu",
        "monitoring_documentation",
        "Legionella detected in high-risk area",
        "Monitoring",
        "T1",
        "High-risk population area exceeded the threshold for response.",
        "High-risk population areas should not return at or above 1 CFU/mL Legionella.",
        `Recorded high-risk area result was ${legionellaHighRiskArea} CFU/mL.`,
        "Exposure consequence is amplified in high-risk units, making this a critical intervention trigger.",
        "Immediate",
      ),
    );
  }

  return rules;
}
