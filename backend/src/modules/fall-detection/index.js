import { route } from "../../http/router.js";
import { sendFeatureNotImplemented } from "../shared/not-implemented.js";

// UC9 / FR13-FR14: Fall detection integration. Placeholder only.
export function createFallDetectionModule() {
  return [
    route("POST", "/api/fall-detection/evaluate", ({ res }) => sendFeatureNotImplemented(res, {
      useCase: "UC9",
      requirements: ["FR13", "FR14"],
    })),
  ];
}
