import { route } from "../../http/router.js";
import { sendFeatureNotImplemented } from "../shared/not-implemented.js";

// UC11 / FR16-FR19: Confirm or cancel alert. Placeholder only.
export function createAlertResponseModule() {
  return [
    route("POST", "/api/alert-responses", ({ res }) => sendFeatureNotImplemented(res, {
      useCase: "UC11",
      requirements: ["FR16", "FR17", "FR18", "FR19"],
    })),
  ];
}
