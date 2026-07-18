import http from "node:http";
import { fileURLToPath } from "node:url";
import { JsonHealthRepository } from "./repository.js";
import { createAuthMiddleware, ensurePatientAccess } from "./auth.js";

const defaultPort = Number(process.env.PORT || 3001);

export function createServer({ repository = new JsonHealthRepository() } = {}) {
  const authenticate = createAuthMiddleware(repository);

  return http.createServer(async (req, res) => {
    setCorsHeaders(res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, "http://localhost");

    try {
      if (req.method === "GET" && url.pathname === "/api/health") {
        return sendJson(res, 200, { success: true, data: { status: "ok" } });
      }

      if (req.method === "GET" && url.pathname === "/api/overview") {
        const user = await authenticate(req, res);
        if (!user) return;

        const patientId = ensurePatientAccess(req, res, user);
        if (!patientId) return;

        const [patient, latestMeasurement, recentMeasurements, thresholds, alertCountToday] = await Promise.all([
          repository.getPatient(patientId),
          repository.getLatestMeasurement(patientId),
          repository.getRecentMeasurements(patientId),
          repository.getThresholds(patientId),
          repository.countAlertsSince(patientId, startOfUtcDay(new Date())),
        ]);

        return sendJson(res, 200, {
          success: true,
          data: {
            patient,
            latestMeasurement: latestMeasurement ? {
              heartRate: latestMeasurement.heartRate,
              spo2: latestMeasurement.spo2,
              measuredAt: latestMeasurement.measuredAt,
            } : null,
            recentMeasurements: recentMeasurements.map((measurement) => ({
              heartRate: measurement.heartRate,
              spo2: measurement.spo2,
              measuredAt: measurement.measuredAt,
            })),
            thresholds: thresholds ? {
              heartRateMin: thresholds.heartRateMin,
              heartRateMax: thresholds.heartRateMax,
              spo2Min: thresholds.spo2Min,
              spo2Max: thresholds.spo2Max,
            } : null,
            alertCountToday,
          },
        });
      }

      if (req.method === "GET" && url.pathname === "/api/alerts") {
        const user = await authenticate(req, res);
        if (!user) return;

        const patientId = ensurePatientAccess(req, res, user);
        if (!patientId) return;

        const alerts = await repository.getAlerts(patientId);
        return sendJson(res, 200, {
          success: true,
          data: alerts.map(toAlertSummary),
        });
      }

      const detailMatch = url.pathname.match(/^\/api\/alerts\/([^/]+)$/);
      if (req.method === "GET" && detailMatch) {
        const user = await authenticate(req, res);
        if (!user) return;

        const alert = await repository.getAlertById(decodeURIComponent(detailMatch[1]));
        if (!alert) {
          return sendJson(res, 404, {
            success: false,
            error: {
              code: "ALERT_NOT_FOUND",
              message: "Alert was not found.",
            },
          });
        }

        if (!user.accessiblePatientIds.includes(alert.patientId)) {
          return sendJson(res, 403, {
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "You do not have permission to access this alert.",
            },
          });
        }

        return sendJson(res, 200, {
          success: true,
          data: toAlertDetail(alert),
        });
      }

      return sendJson(res, 404, {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Route not found.",
        },
      });
    } catch (error) {
      return sendJson(res, 500, {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Could not load data from the repository.",
        },
      });
    }
  });
}

function toAlertSummary(alert) {
  return {
    id: alert.id,
    type: alert.type,
    severity: alert.severity,
    status: alert.status,
    message: alert.message,
    occurredAt: alert.occurredAt,
  };
}

function toAlertDetail(alert) {
  return {
    id: alert.id,
    type: alert.type,
    severity: alert.severity,
    status: alert.status,
    message: alert.message,
    heartRate: alert.heartRate,
    spo2: alert.spo2,
    fallProbability: alert.fallProbability,
    occurredAt: alert.occurredAt,
  };
}

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  createServer().listen(defaultPort, () => {
    console.log(`CareWatch API listening on http://localhost:${defaultPort}`);
  });
}
