import { route } from "../../http/router.js";
import { sendFeatureNotImplemented } from "../shared/not-implemented.js";

// UC10 / FR15: Local device alert command. Placeholder only.
export function createLocalAlertModule() {
  return [
    route("POST", "/api/local-alerts", ({ res }) => sendFeatureNotImplemented(res, {
      useCase: "UC10",
      requirements: ["FR15"],
    })),
  ];
}
