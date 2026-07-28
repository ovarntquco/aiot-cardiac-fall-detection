import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDbPath = path.resolve(__dirname, "../../../database/seed-data.json");

export class JsonHealthRepository {
  constructor(dbPath = process.env.CAREWATCH_DB_PATH || defaultDbPath) {
    this.dbPath = dbPath;
    this.writeQueue = Promise.resolve();
  }

  async readDatabase() {
    const raw = await readFile(this.dbPath, "utf8");
    return JSON.parse(raw);
  }

  async writeDatabase(database) {
    const temporaryPath = `${this.dbPath}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(database, null, 2)}\n`, "utf8");
    await rename(temporaryPath, this.dbPath);
  }

  async findUserByToken(token) {
    const db = await this.readDatabase();
    return db.users.find((user) => user.token === token) || null;
  }

  async getPatient(patientId) {
    const db = await this.readDatabase();
    return db.patients.find((patient) => patient.id === patientId) || null;
  }

  async getLatestMeasurement(patientId) {
    const db = await this.readDatabase();
    return [...db.healthMeasurements]
      .filter((measurement) => measurement.patientId === patientId)
      .sort((a, b) => new Date(b.measuredAt) - new Date(a.measuredAt))[0] || null;
  }

  async getRecentMeasurements(patientId, limit = 12) {
    const db = await this.readDatabase();
    return [...db.healthMeasurements]
      .filter((measurement) => measurement.patientId === patientId)
      .sort((a, b) => new Date(b.measuredAt) - new Date(a.measuredAt))
      .slice(0, limit)
      .reverse();
  }

  async getThresholds(patientId) {
    const db = await this.readDatabase();
    return db.personalThresholds.find((threshold) => threshold.patientId === patientId) || null;
  }

  async updateThresholds(patientId, thresholds) {
    return this.mutateDatabase((db) => {
      const record = { patientId, ...thresholds };
      const index = db.personalThresholds.findIndex(
        (threshold) => threshold.patientId === patientId,
      );

      if (index === -1) {
        db.personalThresholds.push(record);
      } else {
        db.personalThresholds[index] = record;
      }

      return { changed: true, result: record };
    });
  }

  async saveCardiacEvaluation({ reading, alert }) {
    return this.mutateDatabase((db) => {
      const existingReading = db.healthMeasurements.find(
        (measurement) => measurement.id === reading.id,
      );
      const existingAlert = db.alerts.find(
        (candidate) => (
          candidate.patientId === reading.patientId
          && candidate.readingId === reading.id
          && candidate.type === "CARDIAC_ABNORMAL"
        ),
      ) || null;

      if (existingReading) {
        return {
          changed: false,
          result: {
            reading: existingReading,
            alert: existingAlert,
            duplicate: true,
            alertCreated: false,
          },
        };
      }

      db.healthMeasurements.push(reading);
      if (alert && !existingAlert) {
        db.alerts.push(alert);
      }

      return {
        changed: true,
        result: {
          reading,
          alert: alert || existingAlert,
          duplicate: false,
          alertCreated: Boolean(alert && !existingAlert),
        },
      };
    });
  }

  async mutateDatabase(mutator) {
    const operation = this.writeQueue.then(async () => {
      const db = await this.readDatabase();
      const mutation = await mutator(db);
      if (mutation.changed) {
        await this.writeDatabase(db);
      }
      return mutation.result;
    });
    this.writeQueue = operation.then(
      () => undefined,
      () => undefined,
    );
    return operation;
  }

  async getAlerts(patientId) {
    const db = await this.readDatabase();
    return [...db.alerts]
      .filter((alert) => alert.patientId === patientId)
      .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));
  }

  async getAlertById(id) {
    const db = await this.readDatabase();
    return db.alerts.find((alert) => alert.id === id) || null;
  }

  async countAlertsSince(patientId, since) {
    const db = await this.readDatabase();
    return db.alerts.filter((alert) => (
      alert.patientId === patientId && new Date(alert.occurredAt) >= since
    )).length;
  }
}
