"use client";

import * as React from "react";
import {
  type AppState,
  type Audit,
  type AuditSectionKey,
  type Client,
  type Finding,
  type Photo,
  type PlanDraft,
  type Site,
  type UserSession,
} from "@/lib/types";
import { buildAssessmentReport, buildPlanDraft } from "@/lib/generation";
import { evaluateRiskRules } from "@/lib/risk-rules";
import { seedState } from "@/lib/seed";
import { createId } from "@/lib/utils";

const STORAGE_KEY = "clarix-water-intelligence-v1";

type GeneratedReport = ReturnType<typeof buildAssessmentReport>;

type AppContextValue = AppState & {
  isReady: boolean;
  login: (email: string) => void;
  logout: () => void;
  createClient: (payload: Omit<Client, "id" | "createdAt" | "updatedAt">) => string;
  updateClient: (id: string, payload: Partial<Client>) => void;
  createSite: (payload: Omit<Site, "id" | "createdAt" | "updatedAt">) => string;
  updateSite: (id: string, payload: Partial<Site>) => void;
  createAudit: (siteId: string, clientId: string) => string;
  updateAuditSection: (
    auditId: string,
    sectionKey: AuditSectionKey,
    response: Record<string, unknown>,
  ) => void;
  updateAuditStatus: (auditId: string, status: Audit["status"]) => void;
  addFinding: (
    payload: Omit<Finding, "id" | "createdAt" | "updatedAt">,
  ) => string;
  updateFinding: (id: string, payload: Partial<Finding>) => void;
  addPhoto: (payload: Omit<Photo, "id" | "createdAt">) => void;
  generatePlan: (auditId: string) => PlanDraft | null;
  generateReport: (auditId: string) => GeneratedReport | null;
};

const AppContext = React.createContext<AppContextValue | null>(null);

function withUpdatedTimestamp<T extends { updatedAt: string }>(
  value: T,
  patch: Partial<T>,
) {
  return {
    ...value,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AppState>(() => {
    if (typeof window === "undefined") return seedState;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState;
    try {
      return JSON.parse(raw) as AppState;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      return seedState;
    }
  });
  const isReady = true;

  React.useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isReady, state]);

  const login = React.useCallback((email: string) => {
    const [firstPart] = email.split("@");
    const session: UserSession = {
      email,
      name: firstPart
        ? firstPart
            .split(/[._-]/)
            .filter(Boolean)
            .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
            .join(" ")
        : "Clarix Operator",
    };
    setState((current) => ({ ...current, session }));
  }, []);

  const logout = React.useCallback(() => {
    setState((current) => ({ ...current, session: null }));
  }, []);

  const createClient = React.useCallback(
    (payload: Omit<Client, "id" | "createdAt" | "updatedAt">) => {
      const id = createId("client");
      const timestamp = new Date().toISOString();
      const next: Client = {
        ...payload,
        id,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setState((current) => ({ ...current, clients: [next, ...current.clients] }));
      return id;
    },
    [],
  );

  const updateClient = React.useCallback((id: string, payload: Partial<Client>) => {
    setState((current) => ({
      ...current,
      clients: current.clients.map((client) =>
        client.id === id ? withUpdatedTimestamp(client, payload) : client,
      ),
    }));
  }, []);

  const createSite = React.useCallback(
    (payload: Omit<Site, "id" | "createdAt" | "updatedAt">) => {
      const id = createId("site");
      const timestamp = new Date().toISOString();
      const next: Site = {
        ...payload,
        id,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setState((current) => ({ ...current, sites: [next, ...current.sites] }));
      return id;
    },
    [],
  );

  const updateSite = React.useCallback((id: string, payload: Partial<Site>) => {
    setState((current) => ({
      ...current,
      sites: current.sites.map((site) =>
        site.id === id ? withUpdatedTimestamp(site, payload) : site,
      ),
    }));
  }, []);

  const createAudit = React.useCallback((siteId: string, clientId: string) => {
    const site = state.sites.find((entry) => entry.id === siteId);
    const timestamp = new Date().toISOString();
    const id = createId("audit");
    const baseSections = seedState.audits[0].sectionOrder.reduce(
      (acc, key) => {
        acc[key] = {
          key,
          status: "not_started",
          notes: "",
          response: {},
          updatedAt: timestamp,
        };
        return acc;
      },
      {} as Audit["sections"],
    );

    const next: Audit = {
      id,
      clientId,
      siteId,
      status: "draft",
      assessorName: state.session?.name || "",
      assessmentDate: new Date().toISOString().slice(0, 10),
      summary: site ? `New audit started for ${site.name}.` : "New audit started.",
      sectionOrder: seedState.audits[0].sectionOrder,
      sections: baseSections,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setState((current) => ({ ...current, audits: [next, ...current.audits] }));
    return id;
  }, [state.session?.name, state.sites]);

  const updateAuditSection = React.useCallback(
    (
      auditId: string,
      sectionKey: AuditSectionKey,
      response: Record<string, unknown>,
    ) => {
      setState((current) => ({
        ...current,
        audits: current.audits.map((audit) => {
          if (audit.id !== auditId) return audit;
          const status =
            Object.values(response).filter((value) => {
              if (Array.isArray(value)) return value.length > 0;
              if (typeof value === "boolean") return value;
              return String(value ?? "").trim().length > 0;
            }).length > 0
              ? "completed"
              : "not_started";

          return {
            ...audit,
            status: audit.status === "draft" ? "in_progress" : audit.status,
            updatedAt: new Date().toISOString(),
            sections: {
              ...audit.sections,
              [sectionKey]: {
                ...audit.sections[sectionKey],
                response,
                status,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),
      }));
    },
    [],
  );

  const updateAuditStatus = React.useCallback(
    (auditId: string, status: Audit["status"]) => {
      setState((current) => ({
        ...current,
        audits: current.audits.map((audit) =>
          audit.id === auditId
            ? {
                ...audit,
                status,
                completedAt:
                  status === "completed" ? new Date().toISOString() : audit.completedAt,
                updatedAt: new Date().toISOString(),
              }
            : audit,
        ),
      }));
    },
    [],
  );

  const addFinding = React.useCallback(
    (payload: Omit<Finding, "id" | "createdAt" | "updatedAt">) => {
      const timestamp = new Date().toISOString();
      const finding: Finding = {
        ...payload,
        id: createId("finding"),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setState((current) => ({
        ...current,
        findings: [finding, ...current.findings],
      }));
      return finding.id;
    },
    [],
  );

  const updateFinding = React.useCallback((id: string, payload: Partial<Finding>) => {
    setState((current) => ({
      ...current,
      findings: current.findings.map((finding) =>
        finding.id === id ? withUpdatedTimestamp(finding, payload) : finding,
      ),
    }));
  }, []);

  const addPhoto = React.useCallback((payload: Omit<Photo, "id" | "createdAt">) => {
    const photo: Photo = {
      ...payload,
      id: createId("photo"),
      createdAt: new Date().toISOString(),
    };
    setState((current) => ({ ...current, photos: [photo, ...current.photos] }));
  }, []);

  const generatePlan = React.useCallback(
    (auditId: string) => {
      const audit = state.audits.find((entry) => entry.id === auditId);
      if (!audit) return null;
      const site = state.sites.find((entry) => entry.id === audit.siteId);
      const client = state.clients.find((entry) => entry.id === audit.clientId);
      if (!site || !client) return null;
      const findings = state.findings.filter((finding) => finding.auditId === auditId);
      const rules = evaluateRiskRules(audit, site);
      const plan = buildPlanDraft({ audit, client, site, findings, rules });
      setState((current) => ({
        ...current,
        plans: [plan, ...current.plans.filter((entry) => entry.auditId !== auditId)],
      }));
      return plan;
    },
    [state.audits, state.clients, state.findings, state.sites],
  );

  const generateReport = React.useCallback(
    (auditId: string) => {
      const audit = state.audits.find((entry) => entry.id === auditId);
      if (!audit) return null;
      const site = state.sites.find((entry) => entry.id === audit.siteId);
      const client = state.clients.find((entry) => entry.id === audit.clientId);
      if (!site || !client) return null;
      const findings = state.findings.filter((finding) => finding.auditId === auditId);
      const photos = state.photos.filter((photo) => photo.auditId === auditId);
      const existingPlan =
        state.plans.find((plan) => plan.auditId === auditId) ??
        buildPlanDraft({
          audit,
          client,
          site,
          findings,
          rules: evaluateRiskRules(audit, site),
        });

      const generated = buildAssessmentReport({
        audit,
        client,
        site,
        findings,
        photos,
        plan: existingPlan,
      });

      setState((current) => ({
        ...current,
        plans: [existingPlan, ...current.plans.filter((plan) => plan.auditId !== auditId)],
        reports: [
          generated.report,
          ...current.reports.filter((report) => report.auditId !== auditId),
        ],
      }));

      return generated;
    },
    [state.audits, state.clients, state.findings, state.photos, state.plans, state.sites],
  );

  const value = React.useMemo<AppContextValue>(
    () => ({
      ...state,
      isReady,
      login,
      logout,
      createClient,
      updateClient,
      createSite,
      updateSite,
      createAudit,
      updateAuditSection,
      updateAuditStatus,
      addFinding,
      updateFinding,
      addPhoto,
      generatePlan,
      generateReport,
    }),
    [
      addFinding,
      addPhoto,
      createAudit,
      createClient,
      createSite,
      generatePlan,
      generateReport,
      isReady,
      login,
      logout,
      state,
      updateAuditSection,
      updateAuditStatus,
      updateClient,
      updateFinding,
      updateSite,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useClarix() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error("useClarix must be used within AppProvider");
  }
  return context;
}
