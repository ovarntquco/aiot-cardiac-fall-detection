import type { OverviewResponse } from "../api";
import type { MetricStatus } from "../types";

export function getHeartRateStatus(value: number, thresholds: OverviewResponse["thresholds"]): MetricStatus {
  if (!thresholds) return "warning";
  if (value < thresholds.heartRateMin || value > thresholds.heartRateMax) return "critical";
  return "normal";
}

export function getSpo2Status(value: number, thresholds: OverviewResponse["thresholds"]): MetricStatus {
  if (!thresholds) return "warning";
  if (value < thresholds.spo2Min) return "critical";
  if (value > thresholds.spo2Max) return "warning";
  return "normal";
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
