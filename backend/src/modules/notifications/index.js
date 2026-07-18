import { route } from "../../http/router.js";
import { sendFeatureNotImplemented } from "../shared/not-implemented.js";

// UC12 / FR20-FR21: Message notification delivery. Placeholder only.
export function createNotificationsModule() {
  return [
    route("POST", "/api/notifications", ({ res }) => sendFeatureNotImplemented(res, {
      useCase: "UC12",
      requirements: ["FR20", "FR21"],
    })),
  ];
}
