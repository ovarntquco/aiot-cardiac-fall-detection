import { readJsonBody } from "../../http/request.js";
import { sendJson } from "../../http/response.js";
import { createAuthMiddleware, ensureCaregiverRole, ensurePatientAccess } from "../auth/auth.middleware.js";
import {
  getPersonalThresholds,
  restoreDefaultThresholds,
  updatePersonalThresholds,
} from "./personal-thresholds.service.js";

export function createPersonalThresholdsController({ repository }) {
  const authenticate = createAuthMiddleware(repository);

  async function authorize(req, res) {
    const user = await authenticate(req, res);
    if (!user || !ensureCaregiverRole(res, user)) return null;

    return ensurePatientAccess(req, res, user);
  }

  return {
    async show({ req, res }) {
      const patientId = await authorize(req, res);
      if (!patientId) return;

      const result = await getPersonalThresholds({ repository, patientId });
      if (result.status === "not-found") {
        return sendJson(res, 404, {
          success: false,
          error: {
            code: "THRESHOLDS_NOT_FOUND",
            message: "Personal thresholds were not found for this patient.",
          },
        });
      }

      return sendJson(res, 200, { success: true, data: result.data });
    },

    async update({ req, res }) {
      const patientId = await authorize(req, res);
      if (!patientId) return;

      const body = await readJsonBody(req);
      if (!body.ok) {
        return sendJson(res, body.statusCode, { success: false, error: body.error });
      }

      const result = await updatePersonalThresholds({
        repository,
        patientId,
        input: body.data,
      });

      if (result.status === "invalid") {
        return sendJson(res, 400, {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "One or more threshold values are invalid.",
            fields: result.fields,
          },
        });
      }

      return sendJson(res, 200, { success: true, data: result.data });
    },

    async restore({ req, res }) {
      const patientId = await authorize(req, res);
      if (!patientId) return;

      const result = await restoreDefaultThresholds({ repository, patientId });
      return sendJson(res, 200, { success: true, data: result.data });
    },
  };
}
