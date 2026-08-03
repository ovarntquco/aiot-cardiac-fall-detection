export type Screen = "login" | "home" | "alerts" | "patients" | "settings" | "gps" | "patient-overview" | "sos" | "account";
export type PatientSection = "overview" | "alerts" | "gps";

export type MetricStatus = "normal" | "warning" | "critical";

export const screenPaths: Record<Screen, string> = {
  login: "/login",
  home: "/overview",
  alerts: "/alerts",
  patients: "/patients",
  settings: "/settings",
  gps: "/gps",
  "patient-overview": "/patient-overview",
  sos: "/sos",
  account: "/account",
};
