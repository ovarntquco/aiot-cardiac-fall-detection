import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { JsonHealthRepository } from "../src/data/json-health.repository.js";
import { evaluateCardiacReading } from "../src/modules/cardiac-detection/cardiac-detection.evaluator.js";
import { processCardiacReading } from "../src/modules/cardiac-detection/cardiac-detection.service.js";
import { validateAndCleanCardiacReading } from "../src/modules/cardiac-detection/cardiac-detection.validation.js";
import { createServer } from "../src/server.js";

const TOKEN = "cardiac-test-token";
const thresholds = {
  patientId: "PATIENT_1",
  heartRateMin: 60,
  heartRateMax: 100,
  spo2Min: 95,
  spo2Max: 100,
};
const normalReading = {
  id: "READING_1",
  patientId: "PATIENT_1",
  heartRate: 75,
  spo2: 98,
  measuredAt: "2026-07-23T08:00:00.000Z",
};
const fixedNow = () => new Date("2026-07-23T08:00:01.000Z");

describe("cardiac threshold evaluator", () => {
  it("detects heart rate below the personal minimum", () => {
    const result = evaluateCardiacReading(
      { ...normalReading, heartRate: 59 },
      thresholds,
    );

    assert.equal(result.status, "ABNORMAL");
    assert.equal(result.heartRate, "LOW");
    assert.deepEqual(result.reasons[0], {
      metric: "HEART_RATE",
      direction: "LOW",
      value: 59,
      threshold: 60,
    });
  });

  it("detects heart rate above the personal maximum", () => {
    const result = evaluateCardiacReading(
      { ...normalReading, heartRate: 101 },
      thresholds,
    );

    assert.equal(result.status, "ABNORMAL");
    assert.equal(result.heartRate, "HIGH");
  });

  it("detects SpO2 below the personal minimum", () => {
    const result = evaluateCardiacReading(
      { ...normalReading, spo2: 94 },
      thresholds,
    );

    assert.equal(result.status, "ABNORMAL");
    assert.equal(result.spo2, "LOW");
  });

  it("treats exact minimum and maximum boundaries as normal", () => {
    const minimums = evaluateCardiacReading(
      { ...normalReading, heartRate: 60, spo2: 95 },
      thresholds,
    );
    const maximums = evaluateCardiacReading(
      { ...normalReading, heartRate: 100, spo2: 100 },
      thresholds,
    );

    assert.equal(minimums.status, "NORMAL");
    assert.equal(maximums.status, "NORMAL");
  });

  it("does not report an abnormality for values inside the thresholds", () => {
    const result = evaluateCardiacReading(normalReading, thresholds);

    assert.deepEqual(result, {
      status: "NORMAL",
      heartRate: "NORMAL",
      spo2: "NORMAL",
      reasons: [],
    });
  });

  it("rejects missing and invalid sensor data", () => {
    const missing = validateAndCleanCardiacReading({
      patientId: "PATIENT_1",
      heartRate: 75,
    });
    const invalid = validateAndCleanCardiacReading({
      ...normalReading,
      heartRate: Number.NaN,
      spo2: "98",
      measuredAt: "not-a-date",
    });

    assert.equal(missing.valid, false);
    assert.equal(typeof missing.fields.id, "string");
    assert.equal(typeof missing.fields.spo2, "string");
    assert.equal(typeof missing.fields.measuredAt, "string");
    assert.equal(invalid.valid, false);
    assert.equal(typeof invalid.fields.heartRate, "string");
    assert.equal(typeof invalid.fields.spo2, "string");
    assert.equal(typeof invalid.fields.measuredAt, "string");
  });
});

describe("cardiac detection pipeline", () => {
  it("returns a threshold error without persisting when thresholds are missing", async () => {
    await withRepository({ personalThresholds: [] }, async ({ repository, readDatabase }) => {
      const publisher = createPublisherSpy();
      const result = await processCardiacReading({
        input: normalReading,
        repository,
        localAlertPublisher: publisher,
        now: fixedNow,
      });
      const database = await readDatabase();

      assert.equal(result.status, "thresholds-not-found");
      assert.deepEqual(database.healthMeasurements, []);
      assert.deepEqual(database.alerts, []);
      assert.equal(publisher.events.length, 0);
    });
  });

  it("does not create an alert for a normal reading", async () => {
    await withRepository({}, async ({ repository, readDatabase }) => {
      const publisher = createPublisherSpy();
      const result = await processCardiacReading({
        input: normalReading,
        repository,
        localAlertPublisher: publisher,
        now: fixedNow,
      });
      const database = await readDatabase();

      assert.equal(result.data.evaluation.status, "NORMAL");
      assert.equal(result.data.alert, null);
      assert.equal(database.healthMeasurements.length, 1);
      assert.equal(database.alerts.length, 0);
      assert.equal(publisher.events.length, 0);
    });
  });

  it("persists an alert with the correct patient, reading, type, and timestamp", async () => {
    await withRepository({}, async ({ repository, readDatabase }) => {
      const publisher = createPublisherSpy();
      const input = {
        ...normalReading,
        id: "READING_ABNORMAL",
        heartRate: 110,
      };
      const result = await processCardiacReading({
        input,
        repository,
        localAlertPublisher: publisher,
        now: fixedNow,
      });
      const database = await readDatabase();
      const [alert] = database.alerts;

      assert.equal(result.data.evaluation.status, "ABNORMAL");
      assert.equal(alert.patientId, "PATIENT_1");
      assert.equal(alert.readingId, "READING_ABNORMAL");
      assert.equal(alert.type, "CARDIAC_ABNORMAL");
      assert.equal(alert.occurredAt, input.measuredAt);
      assert.equal(alert.confirmedAt, fixedNow().toISOString());
      assert.equal(alert.heartRate, 110);
      assert.equal(alert.spo2, 98);
    });
  });

  it("does not duplicate an alert and publishes the local event exactly once", async () => {
    await withRepository({}, async ({ repository, readDatabase }) => {
      const publisher = createPublisherSpy();
      const input = {
        ...normalReading,
        id: "READING_DUPLICATE",
        spo2: 90,
      };

      const results = await Promise.all([
        processCardiacReading({
          input,
          repository,
          localAlertPublisher: publisher,
          now: fixedNow,
        }),
        processCardiacReading({
          input,
          repository,
          localAlertPublisher: publisher,
          now: fixedNow,
        }),
      ]);
      const database = await readDatabase();

      assert.equal(database.healthMeasurements.length, 1);
      assert.equal(database.alerts.length, 1);
      assert.equal(publisher.events.length, 1);
      assert.equal(results.filter((result) => result.data.duplicate).length, 1);
      assert.deepEqual(publisher.events[0], {
        eventName: "CARDIAC_ABNORMALITY_CONFIRMED",
        patientId: "PATIENT_1",
        alertId: database.alerts[0].id,
        readingId: "READING_DUPLICATE",
        alertType: "CARDIAC_ABNORMAL",
        action: "START",
        occurredAt: input.measuredAt,
      });
    });
  });

  it("processes an authenticated sensor request within the NFR1 limit", async () => {
    await withRepository({}, async ({ repository }) => {
      const publisher = createPublisherSpy();
      await withServer({
        repository,
        localAlertPublisher: publisher,
        now: fixedNow,
      }, async (baseUrl) => {
        const startedAt = performance.now();
        const { response, payload } = await postReading(baseUrl, {
          ...normalReading,
          id: "READING_NFR",
          heartRate: 110,
        });
        const roundTripTimeMs = performance.now() - startedAt;

        assert.equal(response.status, 201);
        assert.equal(payload.data.evaluation.status, "ABNORMAL");
        assert.equal(payload.data.nfr1Met, true);
        assert.ok(payload.data.processingTimeMs <= 2000);
        assert.ok(roundTripTimeMs <= 2000);
        assert.equal(publisher.events.length, 1);
      });
    });
  });

  it("writes a structured, non-sensitive log when processing fails", async () => {
    const loggerEntries = [];
    const repository = {
      async findUserByToken() {
        return {
          id: "USER_1",
          primaryPatientId: "PATIENT_1",
          accessiblePatientIds: ["PATIENT_1"],
        };
      },
      async getThresholds() {
        throw new Error("database unavailable");
      },
    };
    const logger = {
      error(event, context) {
        loggerEntries.push({ event, context });
      },
    };

    await withServer({ repository, logger }, async (baseUrl) => {
      const { response, payload } = await postReading(baseUrl, normalReading);

      assert.equal(response.status, 500);
      assert.equal(payload.error.code, "CARDIAC_DETECTION_ERROR");
      assert.deepEqual(loggerEntries, [{
        event: "cardiac_detection_failed",
        context: { errorType: "Error" },
      }]);
      assert.equal(JSON.stringify(loggerEntries).includes("PATIENT_1"), false);
      assert.equal(JSON.stringify(loggerEntries).includes("75"), false);
      assert.equal(JSON.stringify(loggerEntries).includes("98"), false);
    });
  });
});

function createPublisherSpy() {
  return {
    events: [],
    async publish(event) {
      this.events.push(event);
    },
  };
}

async function withRepository(overrides, run) {
  const directory = await mkdtemp(path.join(tmpdir(), "carewatch-cardiac-"));
  const databasePath = path.join(directory, "database.json");
  const database = {
    users: [
      {
        id: "USER_1",
        token: TOKEN,
        primaryPatientId: "PATIENT_1",
        accessiblePatientIds: ["PATIENT_1"],
      },
    ],
    patients: [{ id: "PATIENT_1", name: "Patient" }],
    healthMeasurements: [],
    personalThresholds: [thresholds],
    alerts: [],
    ...overrides,
  };
  await writeFile(databasePath, JSON.stringify(database), "utf8");
  const repository = new JsonHealthRepository(databasePath);

  try {
    await run({
      repository,
      async readDatabase() {
        return JSON.parse(await readFile(databasePath, "utf8"));
      },
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function withServer(options, run) {
  const server = createServer(options);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function postReading(baseUrl, body) {
  const response = await fetch(`${baseUrl}/api/sensor-data`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return {
    response,
    payload: await response.json(),
  };
}
