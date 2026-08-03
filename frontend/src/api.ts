// API client using Axios
import axios, { AxiosInstance } from "axios";

// Base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Session token handling – persisted in localStorage
let sessionToken = localStorage.getItem("sessionToken") || "";

export function setSessionToken(token: string) {
  sessionToken = token;
  localStorage.setItem("sessionToken", token);
}

// Create an Axios instance with sensible defaults
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send cookies for CORS when needed
});

// Attach the Authorization header to every request when a token exists
api.interceptors.request.use((config) => {
  if (sessionToken) {
    config.headers = config.headers || {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${sessionToken}`;
  }
  return config;
});

// ---- Types ---------------------------------------------------------------
export type LoginResponse = { accessToken: string};

export type OverviewResponse = {
  patient: {
    id: string;
    name?: string;
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
};

export type OverviewHealthStatusValue = "NORMAL" | "ABNORMAL" | "UNKNOWN";

export type GpsResponse = {
  patient: {
    id: string;
    name?: string;
  } | null;
  location: {
    latitude: number;
    longitude: number;
    recordedAt: string;
  } | null;
};

export type AlertSummary = {
  id: string;
  eventId: string;
  deviceId: string;
  patientAccountId: string;
  recordedAt: string | null;
};

type AlertApiResponse = {
  alerts: Array<{
    id: string;
    event_id: string;
    events: {
      device_id: string;
      recorded_at: string | null;
      devices: {
        patient_account_id: string;
      } | null;
    } | null;
  }>;
};

export type AccountResponse = {
  account: {
    id: string;
    full_name?: string | null;
    date_of_birth?: string | null;
    sex?: string;
    height?: number | null;
    weight?: number | null;
    user?: {
      role: "caregiver" | "patient";
    } | null;
  };
};

export type PatientAccount = {
  id: string;
  full_name?: string | null;
  date_of_birth?: string | null;
  sex?: string | null;
  height?: number | null;
  weight?: number | null;
  hr_low?: number | null;
  hr_high?: number | null;
  spo2_low?: number | null;
  caregiver_account_id?: string | null;
};


export class ApiError extends Error {
  code?: string;
  fieldErrors?: Record<string, string>;
  constructor(message: string, opts?: { code?: string; fieldErrors?: Record<string, string> }) {
    super(message);
    this.name = "ApiError";
    this.code = opts?.code;
    this.fieldErrors = opts?.fieldErrors;
  }
}

// ---- Helper to unwrap Axios response & handle errors ----------------------
async function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await promise;
    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError<{
      message?: string;
      error?: { message?: string; code?: string; fields?: Record<string, string> };
    }>(err)) {
      const apiError = err.response?.data?.error;
      if (apiError) {
        throw new ApiError(apiError.message || "API error", {
          code: apiError.code,
          fieldErrors: apiError.fields,
        });
      }
      if (err.response?.data?.message) {
        throw new ApiError(err.response.data.message);
      }
      throw new ApiError(err.message || "Network error");
    }
    throw new ApiError(err instanceof Error ? err.message : "Network error");
  }
}

// ---- API functions --------------------------------------------------------
export async function login(email: string, password: string) {
  const resp = await unwrap<LoginResponse>(
    api.post("/api/auth/login", { email, password }, { headers: { "Content-Type": "application/json" } })
  );
  setSessionToken(resp.accessToken);
  return resp;
}

export async function fetchOverview(patientId?: string) {
  return unwrap<OverviewResponse>(api.get("/api/overview", { params: patientId ? { patientId } : undefined }));
}

export async function fetchGpsLocation(patientId?: string) {
  return unwrap<GpsResponse>(api.get("/api/gps", { params: patientId ? { patientId } : undefined }));
}

export async function fetchAlerts(patientId?: string) {
  const { alerts } = await unwrap<AlertApiResponse>(api.get("/api/alert", { params: patientId ? { patientId } : undefined }));

  return alerts
    .map((alert): AlertSummary => ({
      id: alert.id,
      eventId: alert.event_id,
      deviceId: alert.events?.device_id ?? "",
      patientAccountId: alert.events?.devices?.patient_account_id ?? "",
      recordedAt: alert.events?.recorded_at ?? null,
    }))
    .sort((left, right) => toTimestamp(right.recordedAt) - toTimestamp(left.recordedAt));
}

function toTimestamp(value: string | null) {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export async function fetchMyAccount() {
  return unwrap<AccountResponse>(api.get("/api/account/"));
}

export async function fetchPatients() {
  const response = await unwrap<{ patients: PatientAccount[] }>(api.get("/api/account/patients"));
  return response.patients;
}

export async function createAccount(data: {
  fullName: string;
  dateOfBirth?: string;
  sex?: string;
  height?: number;
  weight?: number;
}) {
  return unwrap<AccountResponse>(api.post("/api/account/create", data));
}

export async function assignCaregiver(caregiverAccountId: string) {
  return unwrap<{ message: string; caregiverAccount: string }>(
    api.post("/api/account/caregiver", { caregiverAccountId })
  );
}

export async function updateVitalsThresholds(
  patientAccountId: string,
  thresholds: { hrLow: number; hrHigh: number; spo2Low: number }
) {
  return unwrap<{
    message: string;
    patient: { accountId: string; hrLow: number; hrHigh: number; spo2Low: number };
  }>(
    api.patch(`/api/account/vitals/${encodeURIComponent(patientAccountId)}`, thresholds)
  );
}

export async function createDevice(data: { deviceId: string; patientAccountId?: string }) {
  return unwrap<{ message: string; device: Record<string, unknown> }>(api.post("/api/device/create", data));
}

export default api;
