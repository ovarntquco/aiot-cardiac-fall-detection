import { route } from "../../http/router.js";
import { createPersonalThresholdsController } from "./personal-thresholds.controller.js";

// UC7 / FR9-FR11: Authorized personal threshold management.
export function createPersonalThresholdsModule(context) {
  const controller = createPersonalThresholdsController(context);

  return [
    route("GET", "/api/personal-thresholds", controller.show),
    route("PUT", "/api/personal-thresholds", controller.update),
    route("POST", "/api/personal-thresholds/restore-defaults", controller.restore),
  ];
}
