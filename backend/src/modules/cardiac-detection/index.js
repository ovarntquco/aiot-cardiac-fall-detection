import { route } from "../../http/router.js";
import { sendFeatureNotImplemented } from "../shared/not-implemented.js";

// UC8 / FR12: Cardiac abnormality detection. Placeholder only.
export function createCardiacDetectionModule() {
  return [
    route("POST", "/api/cardiac-detection/evaluate", ({ res }) => sendFeatureNotImplemented(res, {
      useCase: "UC8",
      requirements: ["FR12"],
    })),
  ];
}
