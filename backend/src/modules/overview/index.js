import { route } from "../../http/router.js";
import { createOverviewController } from "./overview.controller.js";

// UC3 / FR4: View overview. Fully implemented.
export function createOverviewModule(context) {
  const controller = createOverviewController(context);

  return [
    route("GET", "/api/overview", controller.show),
  ];
}
