import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDbPath = path.resolve(__dirname, "../../database/seed-data.json");

export class JsonHealthRepository {
  constructor(dbPath = process.env.CAREWATCH_DB_PATH || defaultDbPath) {
    this.dbPath = dbPath;
  }

  async readDatabase() {
    const raw = await readFile(this.dbPath, "utf8");
    return JSON.parse(raw);
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
