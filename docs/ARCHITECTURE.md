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
- `sensor-data`: minimal validated ingestion adapter implemented for UC8; the real UC2 device transport remains pending.
- `cardiac-detection`: UC8 / FR12 implemented with deterministic threshold rules.
- `sos`: UC5 placeholder.
- `patient-location`: UC6 placeholder.
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

### UC4 API contract

Both UC4 routes require `Authorization: Bearer <token>`.

- `GET /api/alerts?patientId=<id>` returns only alerts for an authorized patient, sorted newest first. It uses `occurredAt`, with `createdAt` as a compatibility fallback.
- `GET /api/alerts/:id` returns the existing alert fields: `id`, `type`, `severity`, `status`, `message`, `occurredAt`, `heartRate`, `spo2`, and `fallProbability`.

Nullable detail measurements are normalized to `null`. A missing alert returns HTTP 404 with `ALERT_NOT_FOUND`; an alert outside `accessiblePatientIds` returns HTTP 403 with `FORBIDDEN`. The project has no existing pagination convention, so UC4 keeps the current array response instead of introducing an incompatible envelope.

### UC8 sensor and detection contract

`POST /api/sensor-data` is the primary UC8 ingestion adapter. `POST /api/cardiac-detection/evaluate` uses the same handler for direct integration. Both require the existing Bearer authentication and patient-scope authorization.

The request body reuses the existing health-measurement shape:

```json
{
  "id": "READING_123",
  "patientId": "PATIENT_DEMO_001",
  "heartRate": 112,
  "spo2": 97,
  "measuredAt": "2026-07-23T08:00:00.000Z"
}
```

The pipeline validates and normalizes the reading, loads that patient's persisted `personalThresholds`, evaluates both metrics with a pure threshold-rule function, and atomically persists the reading plus at most one `CARDIAC_ABNORMAL` alert. Values equal to a minimum or maximum are inside the accepted range. A deterministic alert identifier and serialized JSON-repository writes make repeated or concurrent delivery of the same reading idempotent.

New cardiac alerts store `readingId`, `patientId`, the measured values, `occurredAt`, and `confirmedAt`. A successful new alert publishes exactly one `CARDIAC_ABNORMALITY_CONFIRMED` event through the local-alert publisher interface. UC10 remains responsible for translating that event into buzzer/LED behavior.

Successful responses include `processingTimeMs` and `nfr1Met`. The duration uses a monotonic clock from controller entry through validation, threshold lookup, persistence, and event publication, so it measures a stricter interval than detection alone. Missing thresholds return HTTP 422 with `THRESHOLDS_NOT_FOUND`; invalid readings return HTTP 400 with field errors.

UC8 does not call the AI service and does not modify the UC9 fall-detection placeholder.

### UC7 API contract

All UC7 routes require `Authorization: Bearer <token>`. The authenticated user must have role `caregiver`, and the selected `patientId` must be in `accessiblePatientIds`. When `patientId` is omitted, the user's `primaryPatientId` is used.

- `GET /api/personal-thresholds?patientId=<id>` returns the persisted thresholds and configured input limits.
- `PUT /api/personal-thresholds?patientId=<id>` accepts numeric `heartRateMin`, `heartRateMax`, `spo2Min`, and `spo2Max`.
- `POST /api/personal-thresholds/restore-defaults?patientId=<id>` persists and returns the configurable system defaults.

Validation errors use HTTP 400 with `error.code = "VALIDATION_ERROR"` and field messages in `error.fields`. Defaults and accepted input limits are configured in `backend/src/config/thresholds.js` and may be overridden through the documented `CAREWATCH_*` environment variables; they are operational configuration, not clinical guidance.

## Database

The project does not currently include a database server or ORM. UC3, UC4, UC7, and UC8 use a JSON repository backed by `database/seed-data.json`. Serialized atomic file replacements protect threshold updates and UC8 reading/alert writes from concurrent in-process updates.

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

1. Wearable firmware will eventually send samples through the real UC2 transport; the current HTTP ingestion adapter supports UC8 integration.
2. UC8 validates the sample and reads the patient's personal thresholds.
3. Normal readings are stored without an alert; abnormal readings atomically create one linked cardiac alert.
4. UC8 publishes a local-alert request event without controlling device hardware.
5. UC3 reads latest measurements and thresholds from the repository.
6. UC7 lets an authorized caregiver read, validate, update, or restore a patient's configured thresholds.
7. UC4 reads stored alerts and alert details from the repository.
8. Fall detection, device commands, alert response, and notifications remain separate placeholder modules.

## Implemented vs Placeholder Boundary

UC3/FR4, UC4/FR5, UC7/FR9-FR11, and UC8/FR12 are implemented. UC2 is partial only to the extent needed to accept validated UC8 readings. UC1, UC5, UC6, UC9, UC10, UC11, and UC12 remain scaffolded.
