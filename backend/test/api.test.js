import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createServer } from "../src/server.js";

const TOKEN = "dev-caregiver-token";

function makeRepository(overrides = {}) {
  const db = {
    users: [
      {
        id: "USER_1",
        token: TOKEN,
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
    async getAlerts(patientId) {
      return [...db.alerts]
        .filter((alert) => alert.patientId === patientId)
        .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
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

async function withApi(repository, run) {
  const server = createServer({ repository });
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function getJson(baseUrl, path, token = TOKEN) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const json = await response.json();
  return { response, json };
}

describe("overview API", () => {
  it("returns the latest health indicators and personal thresholds", async () => {
    await withApi(makeRepository(), async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/overview");

      assert.equal(response.status, 200);
      assert.equal(json.success, true);
      assert.equal(json.data.patient.id, "PATIENT_1");
      assert.equal(json.data.latestMeasurement.heartRate, 78);
      assert.equal(json.data.latestMeasurement.spo2, 97);
      assert.equal(json.data.latestMeasurement.measuredAt, "2026-07-18T08:30:00.000Z");
      assert.deepEqual(json.data.thresholds, {
        heartRateMin: 60,
        heartRateMax: 100,
        spo2Min: 95,
        spo2Max: 100,
      });
    });
  });

  it("does not fail when measurement data is empty", async () => {
    await withApi(makeRepository({ healthMeasurements: [] }), async (baseUrl) => {
      const { response, json } = await getJson(baseUrl, "/api/overview");

      assert.equal(response.status, 200);
      assert.equal(json.data.latestMeasurement, null);
      assert.deepEqual(json.data.recentMeasurements, []);
    });
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
      assert.equal(json.data.heartRate, 105);
      assert.equal(json.data.spo2, 93);
      assert.equal(json.data.fallProbability, 0.91);
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
