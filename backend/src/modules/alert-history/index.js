import { route } from "../../http/router.js";
import { createAlertHistoryController } from "./alert-history.controller.js";

// UC4 / FR5: View alert history. Fully implemented.
export function createAlertHistoryModule(context) {
  const controller = createAlertHistoryController(context);

  return [
    route("GET", "/api/alerts", controller.index),
    route("GET", "/api/alerts/:id", controller.show),
  ];
}
