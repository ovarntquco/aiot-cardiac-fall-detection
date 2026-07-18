import { route } from "../../http/router.js";
import { sendFeatureNotImplemented } from "../shared/not-implemented.js";

// UC7 / FR9-FR11: Personal threshold management. Placeholder only.
export function createPersonalThresholdsModule() {
  return [
    route("GET", "/api/personal-thresholds", ({ res }) => sendFeatureNotImplemented(res, {
      useCase: "UC7",
      requirements: ["FR9", "FR10", "FR11"],
    })),
    route("PUT", "/api/personal-thresholds", ({ res }) => sendFeatureNotImplemented(res, {
      useCase: "UC7",
      requirements: ["FR9", "FR10", "FR11"],
    })),
  ];
}
