const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
let sessionToken = import.meta.env.VITE_DEV_AUTH_TOKEN || (import.meta.env.DEV ? "dev-caregiver-token" : "");

export function setSessionToken(token: string) {
  sessionToken = token;
}

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
  healthStatus: {
    overall: OverviewHealthStatusValue;
    heartRate: OverviewHealthStatusValue;
    spo2: OverviewHealthStatusValue;
  };
  dataFreshness: {
    isStale: boolean;
    ageSeconds: number | null;
    staleAfterSeconds: number;
  } | null;
  alertCountToday: number;
};

export type OverviewHealthStatusValue = "NORMAL" | "ABNORMAL" | "UNKNOWN";

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

export type PersonalThresholds = {
  patientId: string;
  heartRateMin: number;
  heartRateMax: number;
  spo2Min: number;
  spo2Max: number;
};

export type PersonalThresholdUpdate = Omit<PersonalThresholds, "patientId">;

export type PersonalThresholdSettings = {
  thresholds: PersonalThresholds;
  limits: {
    heartRate: { min: number; max: number };
    spo2: { min: number; max: number };
  };
};

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
};

export class ApiError extends Error {
  code?: string;
  fieldErrors?: Record<string, string>;

  constructor(message: string, options?: { code?: string; fieldErrors?: Record<string, string> }) {
    super(message);
    this.name = "ApiError";
    this.code = options?.code;
    this.fieldErrors = options?.fieldErrors;
  }
}

export async function fetchOverview() {
  return request<OverviewResponse>("/api/overview");
}

export async function fetchAlerts() {
  return request<AlertSummary[]>("/api/alerts");
}

export async function fetchAlertDetail(id: string) {
  return request<AlertDetail>(`/api/alerts/${encodeURIComponent(id)}`);
}

export async function fetchPersonalThresholds() {
  return request<PersonalThresholdSettings>("/api/personal-thresholds");
}

export async function updatePersonalThresholds(thresholds: PersonalThresholdUpdate) {
  return request<PersonalThresholdSettings>("/api/personal-thresholds", {
    method: "PUT",
    body: thresholds,
  });
}

export async function restoreDefaultThresholds() {
  return request<PersonalThresholdSettings>("/api/personal-thresholds/restore-defaults", {
    method: "POST",
  });
}

async function request<T>(
  path: string,
  options: { method?: "GET" | "PUT" | "POST"; body?: unknown } = {},
): Promise<T> {
  if (!sessionToken) {
    throw new ApiError("Phien dang nhap khong hop le. Vui long dang nhap lai.", {
      code: "UNAUTHORIZED",
    });
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${sessionToken}`,
  };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  let payload: ApiEnvelope<T>;

  try {
    payload = await response.json() as ApiEnvelope<T>;
  } catch {
    throw new ApiError("Khong the ket noi den may chu. Vui long kiem tra ket noi va thu lai.");
  }

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new ApiError(
      payload.error?.message || "Khong the tai du lieu. Vui long thu lai.",
      {
        code: payload.error?.code,
        fieldErrors: payload.error?.fields,
      },
    );
  }

  return payload.data;
}
