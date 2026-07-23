import { readJsonBody } from "../../http/request.js";
import { sendJson } from "../../http/response.js";
import {
  createAuthMiddleware,
  ensurePatientIdAccess,
} from "../auth/auth.middleware.js";
import { processCardiacReading } from "./cardiac-detection.service.js";

export function createCardiacDetectionController({
  repository,
  localAlertPublisher,
  logger,
  now,
  monotonicNow,
}) {
  const authenticate = createAuthMiddleware(repository);

  return {
    async evaluate({ req, res }) {
      const startedAt = monotonicNow();
      const user = await authenticate(req, res);
      if (!user) return;

      const body = await readJsonBody(req);
      if (!body.ok) {
        return sendJson(res, body.statusCode, { success: false, error: body.error });
      }

      const requestedPatientId = typeof body.data.patientId === "string"
        ? body.data.patientId.trim()
        : null;
      if (
        requestedPatientId
        && !ensurePatientIdAccess(res, user, requestedPatientId)
      ) {
        return;
      }

      try {
        const result = await processCardiacReading({
          input: body.data,
          repository,
          localAlertPublisher,
          now,
        });

        if (result.status === "invalid") {
          return sendJson(res, 400, {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "The sensor reading is invalid.",
              fields: result.fields,
            },
          });
        }

        if (result.status === "thresholds-not-found") {
          return sendJson(res, 422, {
            success: false,
            error: {
              code: "THRESHOLDS_NOT_FOUND",
              message: "Personal thresholds are required before evaluating this reading.",
            },
          });
        }

        const processingTimeMs = roundDuration(monotonicNow() - startedAt);
        return sendJson(res, result.data.duplicate ? 200 : 201, {
          success: true,
          data: {
            ...result.data,
            processingTimeMs,
            nfr1Met: processingTimeMs <= 2000,
          },
        });
      } catch (error) {
        logger.error("cardiac_detection_failed", {
          errorType: error?.constructor?.name || "Error",
        });
        return sendJson(res, 500, {
          success: false,
          error: {
            code: "CARDIAC_DETECTION_ERROR",
            message: "The sensor reading could not be processed.",
          },
        });
      }
    },
  };
}

function roundDuration(value) {
  return Math.round(value * 100) / 100;
}
