import { route } from "../../http/router.js";
import { sendFeatureNotImplemented } from "../shared/not-implemented.js";

// UC6 / FR8: Patient location. Placeholder only.
export function createPatientLocationModule() {
  return [
    route("GET", "/api/patient-location", ({ res }) => sendFeatureNotImplemented(res, {
      useCase: "UC6",
      requirements: ["FR8"],
    })),
  ];
}
