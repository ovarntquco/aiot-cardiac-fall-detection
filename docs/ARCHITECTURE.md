# Architecture

## Frontend

The frontend is a Vite React application under `frontend/Healthcare Dashboard UI Prototype`. It keeps the existing dashboard layout and calls the backend through the Vite `/api` proxy.

Frontend module layout:

- `src/app/App.tsx`: screen selection only.
- `src/app/types.ts`: shared screen and UI types.
- `src/app/api.ts`: backend API client and API response types.
- `src/app/lib`: formatting and status helper functions.
- `src/app/components/layout`: shell layout, sidebar, and header.
- `src/app/components/common`: reusable state/detail/placeholder UI.
- `src/app/components/metrics`: overview metric widgets.
- `src/app/screens`: feature screens and placeholder routes.

Implemented screens:

- UC3 / FR4: overview dashboard.
- UC4 / FR5: alert history and alert detail.
- UC7 / FR9-FR11: personal threshold settings with validation, save confirmation, and restore-default confirmation.

Placeholder screens:

- UC5 / FR6-FR7: SOS.
- UC6 / FR8: patient location.

The placeholder screens display "Dang phat trien" and do not show fake medical, GPS, or alert data.

## Backend/API

The backend is a native Node.js ESM API under `backend`. No backend framework has been added. Routing is provided by `backend/src/http/router.js`, and JSON responses are centralized in `backend/src/http/response.js`.

Backend module layout:

- `auth`: UC1 placeholder route plus a dev authentication adapter used to protect implemented API routes.
- `overview`: UC3 / FR4 implemented.
- `alert-history`: UC4 / FR5 implemented.
- `personal-thresholds`: UC7 / FR9-FR11 implemented with caregiver role and patient-scope authorization.
- `sensor-data`: UC2 placeholder.
- `sos`: UC5 placeholder.
- `patient-location`: UC6 placeholder.
- `cardiac-detection`: UC8 placeholder.
- `fall-detection`: UC9 placeholder.
- `local-alert`: UC10 placeholder.
- `alert-response`: UC11 placeholder.
- `notifications`: UC12 placeholder.

Placeholder backend routes return HTTP 501 with the shared `FEATURE_NOT_IMPLEMENTED` response.

### UC3 API contract

`GET /api/overview?patientId=<id>` requires `Authorization: Bearer <token>`. When `patientId` is omitted, the authenticated user's `primaryPatientId` is used. The selected patient must be included in `accessiblePatientIds`.

The response combines only existing repository entities:

- authorized patient identity and `deviceStatus`;
- latest and recent `healthMeasurements`;
- the patient's existing `personalThresholds`;
- backend-derived `healthStatus` values (`NORMAL`, `ABNORMAL`, or `UNKNOWN`);
- `dataFreshness`, including `isStale`, `ageSeconds`, and `staleAfterSeconds`;
- the current-day alert count.

No sensor or threshold schema is duplicated. The stale interval defaults to 15 minutes and can be overridden with `CAREWATCH_OVERVIEW_STALE_AFTER_MINUTES`.

### UC7 API contract

All UC7 routes require `Authorization: Bearer <token>`. The authenticated user must have role `caregiver`, and the selected `patientId` must be in `accessiblePatientIds`. When `patientId` is omitted, the user's `primaryPatientId` is used.

- `GET /api/personal-thresholds?patientId=<id>` returns the persisted thresholds and configured input limits.
- `PUT /api/personal-thresholds?patientId=<id>` accepts numeric `heartRateMin`, `heartRateMax`, `spo2Min`, and `spo2Max`.
- `POST /api/personal-thresholds/restore-defaults?patientId=<id>` persists and returns the configurable system defaults.

Validation errors use HTTP 400 with `error.code = "VALIDATION_ERROR"` and field messages in `error.fields`. Defaults and accepted input limits are configured in `backend/src/config/thresholds.js` and may be overridden through the documented `CAREWATCH_*` environment variables; they are operational configuration, not clinical guidance.

## Database

The project does not currently include a database server or ORM. UC3, UC4, and UC7 use a JSON repository backed by `database/seed-data.json`. UC7 updates the existing `personalThresholds` records through an atomic temporary-file replacement.

Implemented seed entities:

- users
- patients
- healthMeasurements
- personalThresholds
- alerts

Future use-case entities are documented as placeholder types in their modules instead of unused migrations.

## AI Service

`ai-service` contains a UC9 fall-inference scaffold. It exposes only a placeholder route and does not return fake predictions.

## IoT Firmware

The firmware remains unchanged. Placeholder firmware responsibilities are documented in `iot-firmware/docs/PLACEHOLDER_MODULES.md`.

## Expected Data Flow

1. Wearable firmware will eventually collect sensor data and submit it through UC2.
2. Backend stores measurements and personal thresholds.
3. UC3 reads latest measurements and thresholds from the repository.
4. UC7 lets an authorized caregiver read, validate, update, or restore a patient's configured thresholds.
5. Detection modules will eventually create alerts from cardiac or fall events.
6. UC4 reads stored alerts and alert details from the repository.
7. Local alert, alert response, and notification modules remain placeholder until their real device/provider integrations exist.

## Implemented vs Placeholder Boundary

Only UC3/FR4, UC4/FR5, and UC7/FR9-FR11 should be treated as implemented. UC1, UC2, UC5, UC6, UC8, UC9, UC10, UC11, and UC12 are scaffolded only.
