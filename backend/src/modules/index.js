import { route } from "../http/router.js";
import { sendJson } from "../http/response.js";
import { createAuthModule } from "./auth/index.js";
import { createSensorDataModule } from "./sensor-data/index.js";
import { createOverviewModule } from "./overview/index.js";
import { createAlertHistoryModule } from "./alert-history/index.js";
import { createSosModule } from "./sos/index.js";
import { createPatientLocationModule } from "./patient-location/index.js";
import { createPersonalThresholdsModule } from "./personal-thresholds/index.js";
import { createCardiacDetectionModule } from "./cardiac-detection/index.js";
import { createFallDetectionModule } from "./fall-detection/index.js";
import { createLocalAlertModule } from "./local-alert/index.js";
import { createAlertResponseModule } from "./alert-response/index.js";
import { createNotificationsModule } from "./notifications/index.js";

export function createRoutes(context) {
  return [
    route("GET", "/api/health", ({ res }) => sendJson(res, 200, {
      success: true,
      data: { status: "ok" },
    })),
    ...createAuthModule(context),
    ...createSensorDataModule(context),
    ...createOverviewModule(context),
    ...createAlertHistoryModule(context),
    ...createSosModule(context),
    ...createPatientLocationModule(context),
    ...createPersonalThresholdsModule(context),
    ...createCardiacDetectionModule(context),
    ...createFallDetectionModule(context),
    ...createLocalAlertModule(context),
    ...createAlertResponseModule(context),
    ...createNotificationsModule(context),
  ];
}
