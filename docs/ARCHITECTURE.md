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

Placeholder screens:

- UC5 / FR6-FR7: SOS.
- UC6 / FR8: patient location.
- UC7 / FR9-FR11: personal threshold settings.

The placeholder screens display "Dang phat trien" and do not show fake medical, GPS, or alert data.

## Backend/API

The backend is a native Node.js ESM API under `backend`. No backend framework has been added. Routing is provided by `backend/src/http/router.js`, and JSON responses are centralized in `backend/src/http/response.js`.

Backend module layout:

- `auth`: UC1 placeholder route plus a dev authentication adapter used only to support UC3 and UC4.
- `overview`: UC3 / FR4 implemented.
- `alert-history`: UC4 / FR5 implemented.
- `sensor-data`: UC2 placeholder.
- `sos`: UC5 placeholder.
- `patient-location`: UC6 placeholder.
- `personal-thresholds`: UC7 placeholder.
- `cardiac-detection`: UC8 placeholder.
- `fall-detection`: UC9 placeholder.
- `local-alert`: UC10 placeholder.
- `alert-response`: UC11 placeholder.
- `notifications`: UC12 placeholder.

Placeholder backend routes return HTTP 501 with the shared `FEATURE_NOT_IMPLEMENTED` response.

## Database

The project does not currently include a database server or ORM. UC3 and UC4 use a JSON repository backed by `database/seed-data.json`.

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
2. Backend stores measurements and thresholds.
3. UC3 reads latest measurements and thresholds from the repository.
4. Detection modules will eventually create alerts from cardiac or fall events.
5. UC4 reads stored alerts and alert details from the repository.
6. Local alert, alert response, and notification modules remain placeholder until their real device/provider integrations exist.

## Implemented vs Placeholder Boundary

Only UC3/FR4 and UC4/FR5 should be treated as implemented. UC1, UC2, UC5, UC6, UC7, UC8, UC9, UC10, UC11, and UC12 are scaffolded only.
