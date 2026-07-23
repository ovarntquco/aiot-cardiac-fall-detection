export type Screen = "login" | "home" | "alerts" | "sos" | "settings" | "gps";

export type MetricStatus = "normal" | "warning" | "critical";

export const screenPaths: Record<Screen, string> = {
  login: "/login",
  home: "/overview",
  alerts: "/alerts",
  sos: "/sos",
  settings: "/settings",
  gps: "/gps",
};
