import { route } from "../../http/router.js";
import { sendFeatureNotImplemented } from "../shared/not-implemented.js";

// UC5 / FR6-FR7: SOS signal. Placeholder only.
export function createSosModule() {
  return [
    route("POST", "/api/sos", ({ res }) => sendFeatureNotImplemented(res, {
      useCase: "UC5",
      requirements: ["FR6", "FR7"],
    })),
  ];
}
