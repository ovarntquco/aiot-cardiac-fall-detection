import { sendJson } from "../../http/response.js";
import { createAuthMiddleware, ensurePatientAccess } from "../auth/auth.middleware.js";
import { getAlertDetail, listAlerts } from "./alert-history.service.js";

export function createAlertHistoryController({ repository }) {
  const authenticate = createAuthMiddleware(repository);

  return {
    async index({ req, res }) {
      const user = await authenticate(req, res);
      if (!user) return;

      const patientId = ensurePatientAccess(req, res, user);
      if (!patientId) return;

      return sendJson(res, 200, {
        success: true,
        data: await listAlerts({ repository, patientId }),
      });
    },

    async show({ req, res, params }) {
      const user = await authenticate(req, res);
      if (!user) return;

      const result = await getAlertDetail({ repository, alertId: params.id, user });

      if (result.status === "not-found") {
        return sendJson(res, 404, {
          success: false,
          error: {
            code: "ALERT_NOT_FOUND",
            message: "Alert was not found.",
          },
        });
      }

      if (result.status === "forbidden") {
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
        data: result.data,
      });
    },
  };
}
