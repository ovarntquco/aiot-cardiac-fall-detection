import type { OverviewHealthStatusValue } from "../api";
import type { MetricStatus } from "../types";

export function toMetricStatus(status: OverviewHealthStatusValue): MetricStatus {
  if (status === "ABNORMAL") return "critical";
  if (status === "NORMAL") return "normal";
  return "warning";
}

export function statusLabel(status: MetricStatus) {
  if (status === "critical") return "Canh bao";
  if (status === "warning") return "Can theo doi";
  return "Binh thuong";
}

export function severityStyle(severity: string) {
  const normalized = severity.toUpperCase();
  if (normalized === "HIGH" || normalized === "CRITICAL") {
    return { badge: "bg-red-50 text-red-700", dot: "bg-red-500" };
  }
  if (normalized === "MEDIUM" || normalized === "WARNING") {
    return { badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500" };
  }
  return { badge: "bg-blue-50 text-blue-700", dot: "bg-blue-400" };
}
