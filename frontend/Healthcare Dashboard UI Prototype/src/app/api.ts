const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const DEV_AUTH_TOKEN = import.meta.env.VITE_DEV_AUTH_TOKEN || "dev-caregiver-token";

export type OverviewResponse = {
  patient: {
    id: string;
    name?: string;
    age?: number;
    deviceStatus?: string;
  } | null;
  latestMeasurement: {
    heartRate: number;
    spo2: number;
    measuredAt: string;
  } | null;
  recentMeasurements: {
    heartRate: number;
    spo2: number;
    measuredAt: string;
  }[];
  thresholds: {
    heartRateMin: number;
    heartRateMax: number;
    spo2Min: number;
    spo2Max: number;
  } | null;
  alertCountToday: number;
};

export type AlertSummary = {
  id: string;
  type: string;
  severity: string;
  status?: string;
  message: string;
  occurredAt: string;
};

export type AlertDetail = AlertSummary & {
  heartRate: number | null;
  spo2: number | null;
  fallProbability: number | null;
};

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};

export async function fetchOverview() {
  return request<OverviewResponse>("/api/overview");
}

export async function fetchAlerts() {
  return request<AlertSummary[]>("/api/alerts");
}

export async function fetchAlertDetail(id: string) {
  return request<AlertDetail>(`/api/alerts/${encodeURIComponent(id)}`);
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${DEV_AUTH_TOKEN}`,
    },
  });
  const payload = await response.json() as ApiEnvelope<T>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.error?.message || "Khong the tai du lieu. Vui long thu lai.");
  }

  return payload.data;
}
