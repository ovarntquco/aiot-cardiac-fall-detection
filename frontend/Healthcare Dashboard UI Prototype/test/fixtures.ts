import type {
  AlertDetail,
  AlertSummary,
  OverviewResponse,
  PersonalThresholdSettings,
} from "../src/app/api";

export const overviewFixture: OverviewResponse = {
  patient: {
    id: "PATIENT_TEST_001",
    name: "Nguyen Thi Hoa",
    age: 72,
    deviceStatus: "CONNECTED",
  },
  latestMeasurement: {
    heartRate: 78,
    spo2: 97,
    measuredAt: "2026-07-23T08:30:00.000Z",
  },
  recentMeasurements: [
    {
      heartRate: 76,
      spo2: 98,
      measuredAt: "2026-07-23T08:25:00.000Z",
    },
    {
      heartRate: 78,
      spo2: 97,
      measuredAt: "2026-07-23T08:30:00.000Z",
    },
  ],
  thresholds: {
    heartRateMin: 60,
    heartRateMax: 100,
    spo2Min: 95,
    spo2Max: 100,
  },
  healthStatus: {
    overall: "NORMAL",
    heartRate: "NORMAL",
    spo2: "NORMAL",
  },
  dataFreshness: {
    isStale: false,
    ageSeconds: 30,
    staleAfterSeconds: 900,
  },
  alertCountToday: 1,
};

export const thresholdSettingsFixture: PersonalThresholdSettings = {
  thresholds: {
    patientId: "PATIENT_TEST_001",
    heartRateMin: 60,
    heartRateMax: 100,
    spo2Min: 95,
    spo2Max: 100,
  },
  limits: {
    heartRate: { min: 1, max: 300 },
    spo2: { min: 0, max: 100 },
  },
};

export const cardiacAlertSummaryFixture: AlertSummary = {
  id: "ALERT_CARDIAC_001",
  type: "CARDIAC_ABNORMAL",
  severity: "HIGH",
  status: null,
  message: "Phat hien bat thuong tim mach",
  occurredAt: null,
};

export const cardiacAlertDetailFixture: AlertDetail = {
  ...cardiacAlertSummaryFixture,
  heartRate: null,
  spo2: null,
  fallProbability: null,
};
