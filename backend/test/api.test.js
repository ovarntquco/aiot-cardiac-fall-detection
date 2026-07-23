import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createServer } from "../src/server.js";
import { defaultThresholds } from "../src/config/thresholds.js";

const TOKEN = "dev-caregiver-token";

function makeRepository(overrides = {}) {
  const db = {
    users: [
      {
        id: "USER_1",
        token: TOKEN,
        role: "caregiver",
        primaryPatientId: "PATIENT_1",
        accessiblePatientIds: ["PATIENT_1"],
      },
    ],
    patients: [
      { id: "PATIENT_1", name: "Nguyen Thi Hoa", age: 78, deviceStatus: "CONNECTED" },
      { id: "PATIENT_2", name: "Le Van Minh", age: 82, deviceStatus: "CONNECTED" },
    ],
    healthMeasurements: [
      { id: "M_OLD", patientId: "PATIENT_1", heartRate: 70, spo2: 98, measuredAt: "2026-07-18T07:00:00.000Z" },
      { id: "M_NEW", patientId: "PATIENT_1", heartRate: 78, spo2: 97, measuredAt: "2026-07-18T08:30:00.000Z" },
    ],
    personalThresholds: [
      { patientId: "PATIENT_1", heartRateMin: 60, heartRateMax: 100, spo2Min: 95, spo2Max: 100 },
    ],
    alerts: [
      {
        id: "ALERT_OLDER",
        patientId: "PATIENT_1",
        type: "LOW_SPO2",
        severity: "MEDIUM",
        status: "RESOLVED",
        message: "SpO2 thap",
        heartRate: 84,
        spo2: 91,
        fallProbability: null,
        occurredAt: "2026-07-17T08:20:00.000Z",
      },
      {
        id: "ALERT_NEWER",
        patientId: "PATIENT_1",
        type: "FALL_DETECTED",
        severity: "HIGH",
        status: "CONFIRMED",
        message: "Phat hien nguy co te nga",
        heartRate: 105,
        spo2: 93,
        fallProbability: 0.91,
        occurredAt: "2026-07-18T08:20:00.000Z",
      },
      {
        id: "ALERT_FORBIDDEN",
        patientId: "PATIENT_2",
        type: "SOS",
        severity: "HIGH",
        status: "CONFIRMED",
        message: "Benh nhan khac",
        heartRate: 101,
        spo2: 94,
        fallProbability: 0.72,
        occurredAt: "2026-07-18T09:00:00.000Z",
      },
    ],
    ...overrides,
  };

  return {
    async findUserByToken(token) {
      return db.users.find((user) => user.token === token) || null;
    },
    async getPatient(patientId) {
      return db.patients.find((patient) => patient.id === patientId) || null;
    },
    async getLatestMeasurement(patientId) {
      return [...db.healthMeasurements]
        .filter((measurement) => measurement.patientId === patientId)
        .sort((a, b) => new Date(b.measuredAt) - new Date(a.measuredAt))[0] || null;
    },
    async getRecentMeasurements(patientId) {
      return [...db.healthMeasurements]
        .filter((measurement) => measurement.patientId === patientId)
        .sort((a, b) => new Date(a.measuredAt) - new Date(b.measuredAt));
    },
    async getThresholds(patientId) {
      return db.personalThresholds.find((threshold) => threshold.patientId === patientId) || null;
    },
    async updateThresholds(patientId, thresholds) {
      const record = { patientId, ...thresholds };
      const currentIndex = db.personalThresholds.findIndex(
        (threshold) => threshold.patientId === patientId,
      );

      if (currentIndex === -1) {
        db.personalThresholds.push(record);
      } else {
        db.personalThresholds[currentIndex] = record;
      }

      return record;
    },
    async getAlerts(patientId) {
      return [...db.alerts]
        .filter((alert) => alert.patientId === patientId);
    },
    async getAlertById(id) {
      return db.alerts.find((alert) => alert.id === id) || null;
    },
    async countAlertsSince(patientId, since) {
      return db.alerts.filter((alert) => (
        alert.patientId === patientId && new Date(alert.occurredAt) >= since
      )).length;
    },
  };
}

async function withApi(repository, run, options = {}) {
  const server = createServer({ repository, ...options });
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function getJson(baseUrl, path, token = TOKEN) {
  return requestJson(baseUrl, path, { token });
}

async function requestJson(
  baseUrl,
  path,
  { method = "GET", token = TOKEN, body } = {},
) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await response.json();
  return { response, json };
}

describe("overview API", () => {
  it("maps the latest health indicators, timestamp, thresholds, and status", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/overview");

      assert.equal(response.status, 200);
      assert.equal(json.success, true);
      assert.equal(json.data.patient.id, "PATIENT_1");
      assert.equal(json.data.latestMeasurement.heartRate, 78);
      assert.equal(json.data.latestMeasurement.spo2, 97);
      assert.equal(json.data.latestMeasurement.measuredAt, "2026-07-18T08:30:00.000Z");
      assert.equal(json.data.patient.deviceStatus, "CONNECTED");
      assert.deepEqual(json.data.thresholds, {
        heartRateMin: 60,
        heartRateMax: 100,
        spo2Min: 95,
        spo2Max: 100,
      });
      assert.deepEqual(json.data.healthStatus, {
        overall: "NORMAL",
        heartRate: "NORMAL",
        spo2: "NORMAL",
      });
      assert.deepEqual(json.data.dataFreshness, {
        isStale: false,
        ageSeconds: 600,
        staleAfterSeconds: 900,
      });
    }, { now: () => new Date("2026-07-18T08:40:00.000Z") });
  });

  it("does not fail when measurement data is empty", async () => {
    await withApi(makeRepository({ healthMeasurements: [] }), async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/overview");

      assert.equal(response.status, 200);
      assert.equal(json.data.latestMeasurement, null);
      assert.deepEqual(json.data.recentMeasurements, []);
      assert.equal(json.data.dataFreshness, null);
      assert.deepEqual(json.data.healthStatus, {
        overall: "UNKNOWN",
        heartRate: "UNKNOWN",
        spo2: "UNKNOWN",
      });
    });
  });

  it("marks old measurements as stale", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/overview");

      assert.equal(response.status, 200);
      assert.equal(json.data.dataFreshness.isStale, true);
      assert.equal(json.data.dataFreshness.ageSeconds, 3600);
      assert.equal(json.data.dataFreshness.staleAfterSeconds, 900);
    }, { now: () => new Date("2026-07-18T09:30:00.000Z") });
  });

  it("maps measurements outside personal thresholds as abnormal", async () => {
    const repository = makeRepository({
      healthMeasurements: [
        {
          id: "M_ABNORMAL",
          patientId: "PATIENT_1",
          heartRate: 112,
          spo2: 91,
          measuredAt: "2026-07-18T08:30:00.000Z",
        },
      ],
    });

    await withApi(repository, async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/overview");

      assert.equal(response.status, 200);
      assert.deepEqual(json.data.healthStatus, {
        overall: "ABNORMAL",
        heartRate: "ABNORMAL",
        spo2: "ABNORMAL",
      });
    }, { now: () => new Date("2026-07-18T08:35:00.000Z") });
  });

  it("returns 401 when the user is not authenticated", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/overview", null);

      assert.equal(response.status, 401);
      assert.equal(json.success, false);
    });
  });

  it("returns a structured error when the repository fails", async () => {
    const repository = {
      async findUserByToken() {
        return { id: "USER_1", primaryPatientId: "PATIENT_1", accessiblePatientIds: ["PATIENT_1"] };
      },
      async getPatient() {
        throw new Error("database unavailable");
      },
      async getLatestMeasurement() {},
      async getRecentMeasurements() {},
      async getThresholds() {},
      async countAlertsSince() {},
    };

    await withApi(repository, async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/overview");

      assert.equal(response.status, 500);
      assert.equal(json.error.code, "DATABASE_ERROR");
    });
  });

  it("rejects overview access for a patient outside the user's permissions", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/overview?patientId=PATIENT_2");

      assert.equal(response.status, 403);
      assert.equal(json.error.code, "FORBIDDEN");
    });
  });
});

describe("alerts API", () => {
  it("returns the alert list successfully", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/alerts");

      assert.equal(response.status, 200);
      assert.equal(json.success, true);
      assert.equal(json.data.length, 2);
    });
  });

  it("sorts alerts with the newest first", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { json } = await getJson(baseUrl, "/api/alerts");

      assert.deepEqual(json.data.map((alert) => alert.id), ["ALERT_NEWER", "ALERT_OLDER"]);
    });
  });

  it("returns alert detail by id", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/alerts/ALERT_NEWER");

      assert.equal(response.status, 200);
      assert.equal(json.data.id, "ALERT_NEWER");
      assert.equal(json.data.type, "FALL_DETECTED");
      assert.equal(json.data.occurredAt, "2026-07-18T08:20:00.000Z");
      assert.equal(json.data.status, "CONFIRMED");
      assert.equal(json.data.message, "Phat hien nguy co te nga");
      assert.equal(json.data.heartRate, 105);
      assert.equal(json.data.spo2, 93);
      assert.equal(json.data.fallProbability, 0.91);
    });
  });

  it("returns nullable alert detail fields without dropping them", async () => {
    const repository = makeRepository({
      alerts: [
        {
          id: "ALERT_NULLABLE",
          patientId: "PATIENT_1",
          type: "SOS",
          severity: "LOW",
          status: null,
          message: "Tin hieu khong kem chi so",
          heartRate: null,
          spo2: null,
          fallProbability: null,
          occurredAt: "2026-07-18T10:00:00.000Z",
        },
      ],
    });

    await withApi(repository, async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/alerts/ALERT_NULLABLE");

      assert.equal(response.status, 200);
      assert.equal(json.data.status, null);
      assert.equal(json.data.heartRate, null);
      assert.equal(json.data.spo2, null);
      assert.equal(json.data.fallProbability, null);
    });
  });

  it("uses createdAt as a sorting and response fallback when occurredAt is absent", async () => {
    const repository = makeRepository({
      alerts: [
        {
          id: "ALERT_CREATED_OLDER",
          patientId: "PATIENT_1",
          type: "SYSTEM",
          severity: "LOW",
          status: "RESOLVED",
          message: "Canh bao cu",
          createdAt: "2026-07-18T07:00:00.000Z",
        },
        {
          id: "ALERT_CREATED_NEWER",
          patientId: "PATIENT_1",
          type: "SYSTEM",
          severity: "LOW",
          status: "NEW",
          message: "Canh bao moi",
          createdAt: "2026-07-18T09:00:00.000Z",
        },
      ],
    });

    await withApi(repository, async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/alerts");

      assert.equal(response.status, 200);
      assert.deepEqual(
        json.data.map((alert) => alert.id),
        ["ALERT_CREATED_NEWER", "ALERT_CREATED_OLDER"],
      );
      assert.equal(json.data[0].occurredAt, "2026-07-18T09:00:00.000Z");
    });
  });

  it("returns 404 when the alert id does not exist", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/alerts/UNKNOWN");

      assert.equal(response.status, 404);
      assert.equal(json.error.code, "ALERT_NOT_FOUND");
    });
  });

  it("returns an empty list when there are no alerts", async () => {
    await withApi(makeRepository({ alerts: [] }), async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/alerts");

      assert.equal(response.status, 200);
      assert.deepEqual(json.data, []);
    });
  });

  it("returns 401 when the user is not authenticated", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { response } = await getJson(baseUrl, "/api/alerts", null);

      assert.equal(response.status, 401);
    });
  });

  it("does not allow access to another patient's alert", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/alerts/ALERT_FORBIDDEN");

      assert.equal(response.status, 403);
      assert.equal(json.error.code, "FORBIDDEN");
    });
  });

  it("rejects alert list access for a patient outside the user's permissions", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/alerts?patientId=PATIENT_2");

      assert.equal(response.status, 403);
      assert.equal(json.error.code, "FORBIDDEN");
    });
  });

  it("returns a structured error when alert list repository access fails", async () => {
    const repository = {
      async findUserByToken() {
        return { id: "USER_1", primaryPatientId: "PATIENT_1", accessiblePatientIds: ["PATIENT_1"] };
      },
      async getAlerts() {
        throw new Error("database unavailable");
      },
    };

    await withApi(repository, async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/alerts");

      assert.equal(response.status, 500);
      assert.equal(json.error.code, "DATABASE_ERROR");
    });
  });
});

describe("personal thresholds API", () => {
  it("gets the current thresholds and configurable system limits", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { response, json } = await getJson(
        baseUrl,
        "/api/personal-thresholds?patientId=PATIENT_1",
      );

      assert.equal(response.status, 200);
      assert.deepEqual(json.data.thresholds, {
        patientId: "PATIENT_1",
        heartRateMin: 60,
        heartRateMax: 100,
        spo2Min: 95,
        spo2Max: 100,
      });
      assert.equal(typeof json.data.limits.heartRate.min, "number");
      assert.equal(typeof json.data.limits.spo2.max, "number");
    });
  });

  it("updates valid thresholds and returns the persisted values", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const update = {
        heartRateMin: 55,
        heartRateMax: 110,
        spo2Min: 92,
        spo2Max: 99,
      };
      const { response, json } = await requestJson(
        baseUrl,
        "/api/personal-thresholds?patientId=PATIENT_1",
        { method: "PUT", body: update },
      );

      assert.equal(response.status, 200);
      assert.deepEqual(json.data.thresholds, {
        patientId: "PATIENT_1",
        ...update,
      });

      const current = await getJson(
        baseUrl,
        "/api/personal-thresholds?patientId=PATIENT_1",
      );
      assert.deepEqual(current.json.data.thresholds, {
        patientId: "PATIENT_1",
        ...update,
      });
    });
  });

  it("rejects min values that are not less than max values", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { response, json } = await requestJson(
        baseUrl,
        "/api/personal-thresholds?patientId=PATIENT_1",
        {
          method: "PUT",
          body: {
            heartRateMin: 100,
            heartRateMax: 100,
            spo2Min: 95,
            spo2Max: 100,
          },
        },
      );

      assert.equal(response.status, 400);
      assert.equal(json.error.code, "VALIDATION_ERROR");
      assert.equal(typeof json.error.fields.heartRateMin, "string");
      assert.equal(typeof json.error.fields.heartRateMax, "string");
    });
  });

  it("rejects non-numeric threshold values", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { response, json } = await requestJson(
        baseUrl,
        "/api/personal-thresholds?patientId=PATIENT_1",
        {
          method: "PUT",
          body: {
            heartRateMin: "sixty",
            heartRateMax: 100,
            spo2Min: 95,
            spo2Max: 100,
          },
        },
      );

      assert.equal(response.status, 400);
      assert.equal(json.error.code, "VALIDATION_ERROR");
      assert.equal(typeof json.error.fields.heartRateMin, "string");
    });
  });

  it("rejects threshold values outside the configured system limits", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { response, json } = await requestJson(
        baseUrl,
        "/api/personal-thresholds?patientId=PATIENT_1",
        {
          method: "PUT",
          body: {
            heartRateMin: 0,
            heartRateMax: 100,
            spo2Min: 95,
            spo2Max: 101,
          },
        },
      );

      assert.equal(response.status, 400);
      assert.equal(json.error.code, "VALIDATION_ERROR");
      assert.equal(typeof json.error.fields.heartRateMin, "string");
      assert.equal(typeof json.error.fields.spo2Max, "string");
    });
  });

  it("rejects changes outside the caregiver's authorized patients", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { response, json } = await requestJson(
        baseUrl,
        "/api/personal-thresholds?patientId=PATIENT_2",
        {
          method: "PUT",
          body: {
            heartRateMin: 55,
            heartRateMax: 110,
            spo2Min: 92,
            spo2Max: 99,
          },
        },
      );

      assert.equal(response.status, 403);
      assert.equal(json.error.code, "FORBIDDEN");
    });
  });

  it("rejects changes from an authenticated non-caregiver", async () => {
    const repository = makeRepository({
      users: [
        {
          id: "USER_1",
          token: TOKEN,
          role: "patient",
          primaryPatientId: "PATIENT_1",
          accessiblePatientIds: ["PATIENT_1"],
        },
      ],
    });

    await withApi(repository, async (baseUrl) => {
      const { response, json } = await requestJson(
        baseUrl,
        "/api/personal-thresholds?patientId=PATIENT_1",
        {
          method: "PUT",
          body: {
            heartRateMin: 55,
            heartRateMax: 110,
            spo2Min: 92,
            spo2Max: 99,
          },
        },
      );

      assert.equal(response.status, 403);
      assert.equal(json.error.code, "FORBIDDEN");
    });
  });

  it("restores configured defaults after confirmation", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      await requestJson(
        baseUrl,
        "/api/personal-thresholds?patientId=PATIENT_1",
        {
          method: "PUT",
          body: {
            heartRateMin: 55,
            heartRateMax: 110,
            spo2Min: 92,
            spo2Max: 99,
          },
        },
      );

      const { response, json } = await requestJson(
        baseUrl,
        "/api/personal-thresholds/restore-defaults?patientId=PATIENT_1",
        { method: "POST" },
      );

      assert.equal(response.status, 200);
      assert.deepEqual(json.data.thresholds, {
        patientId: "PATIENT_1",
        ...defaultThresholds,
      });
    });
  });
});

describe("placeholder API modules", () => {
  it("returns 501 for scaffolded routes", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/patient-location");

      assert.equal(response.status, 501);
      assert.equal(json.success, false);
      assert.equal(json.error.code, "FEATURE_NOT_IMPLEMENTED");
      assert.equal(json.error.useCase, "UC6");
      assert.deepEqual(json.error.requirements, ["FR8"]);
    });
  });
});
