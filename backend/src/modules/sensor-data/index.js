import { route } from "../../http/router.js";
import { createCardiacDetectionController } from "../cardiac-detection/cardiac-detection.controller.js";

// Minimal ingestion adapter used by UC8. Device collection details remain UC2 scope.
export function createSensorDataModule(context) {
  const cardiacDetection = createCardiacDetectionController(context);

  return [
    route("POST", "/api/sensor-data", cardiacDetection.evaluate),
  ];
}
