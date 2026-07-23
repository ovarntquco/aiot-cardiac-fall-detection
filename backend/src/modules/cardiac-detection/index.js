import { route } from "../../http/router.js";
import { createCardiacDetectionController } from "./cardiac-detection.controller.js";

// UC8 / FR12: Rule-based cardiac abnormality detection.
export function createCardiacDetectionModule(context) {
  const controller = createCardiacDetectionController(context);

  return [
    route("POST", "/api/cardiac-detection/evaluate", controller.evaluate),
  ];
}
