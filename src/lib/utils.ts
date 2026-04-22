import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatRelativeDays(days?: number) {
  if (!days) return "No due date";
  return `Within ${days} day${days === 1 ? "" : "s"}`;
}

export function percentage(value: number, total: number) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function formatMeasurement(
  value: number | undefined,
  suffix: string,
  fallback = "Not recorded",
) {
  if (value === undefined || Number.isNaN(value)) {
    return fallback;
  }

  return `${value}${suffix}`;
}
