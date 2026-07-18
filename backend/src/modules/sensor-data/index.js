import { route } from "../../http/router.js";
import { sendFeatureNotImplemented } from "../shared/not-implemented.js";

// UC2 / FR2-FR3: Sensor data ingestion. Placeholder only.
export function createSensorDataModule() {
  return [
    route("POST", "/api/sensor-data", ({ res }) => sendFeatureNotImplemented(res, {
      useCase: "UC2",
      requirements: ["FR2", "FR3"],
    })),
  ];
}
