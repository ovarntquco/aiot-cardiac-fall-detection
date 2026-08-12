export type PatientSection = "overview" | "alerts" | "gps";
export type PatientScreen = `patient-${PatientSection}`;
export type Screen = "login" | "home" | "alerts" | "patients" | "settings" | "gps" | "account" | PatientScreen;

export type MetricStatus = "normal" | "warning" | "critical";

export const screenPaths: Record<Screen, string> = {
  login: "/login",
  home: "/overview",
  alerts: "/alerts",
  patients: "/patients",
  settings: "/settings",
  gps: "/gps",
  "patient-overview": "/patients/overview",
  "patient-alerts": "/patients/alerts",
  "patient-gps": "/patients/gps",
  account: "/account",
};
