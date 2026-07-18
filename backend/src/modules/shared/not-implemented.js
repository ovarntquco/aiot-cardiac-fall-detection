import { sendJson } from "../../http/response.js";

export function sendFeatureNotImplemented(res, { useCase, requirements }) {
  return sendJson(res, 501, {
    success: false,
    error: {
      code: "FEATURE_NOT_IMPLEMENTED",
      message: "This feature is scaffolded but not implemented yet.",
      useCase,
      requirements,
    },
  });
}
