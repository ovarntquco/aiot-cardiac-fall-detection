import { sendJson } from "../../http/response.js";
import { createAuthMiddleware, ensurePatientAccess } from "../auth/auth.middleware.js";
import { getOverview } from "./overview.service.js";

export function createOverviewController({ repository, now }) {
  const authenticate = createAuthMiddleware(repository);

  return {
    async show({ req, res }) {
      const user = await authenticate(req, res);
      if (!user) return;

      const patientId = ensurePatientAccess(req, res, user);
      if (!patientId) return;

      return sendJson(res, 200, {
        success: true,
        data: await getOverview({ repository, patientId, now }),
      });
    },
  };
}
