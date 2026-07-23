# Implementation Status

| Use Case | FR | Chuc nang | Thanh phan | Trang thai |
|----------|----|-----------|------------|------------|
| UC1 | FR1 | Dang nhap | `backend/src/modules/auth`, frontend login dev gate | PLACEHOLDER |
| UC2 | FR2-FR3 | Thu thap du lieu cam bien | `backend/src/modules/sensor-data`, `iot-firmware/docs/PLACEHOLDER_MODULES.md` | PLACEHOLDER |
| UC3 | FR4 | Xem thong tin tong quan | `backend/src/modules/overview`, frontend Home screen | IMPLEMENTED |
| UC4 | FR5 | Xem lich su canh bao | `backend/src/modules/alert-history`, frontend Alert History screen | IMPLEMENTED |
| UC5 | FR6-FR7 | Gui tin hieu SOS | `backend/src/modules/sos`, frontend SOS placeholder, firmware placeholder docs | PLACEHOLDER |
| UC6 | FR8 | Xem vi tri benh nhan | `backend/src/modules/patient-location`, frontend GPS placeholder | PLACEHOLDER |
| UC7 | FR9-FR11 | Hieu chinh nguong ca nhan | `backend/src/modules/personal-thresholds`, frontend Settings screen | IMPLEMENTED |
| UC8 | FR12 | Phat hien bat thuong tim mach | `backend/src/modules/cardiac-detection` | PLACEHOLDER |
| UC9 | FR13-FR14 | Phat hien te nga | `backend/src/modules/fall-detection`, `ai-service/src/modules/fall-inference` | PLACEHOLDER |
| UC10 | FR15 | Canh bao cuc bo tai thiet bi | `backend/src/modules/local-alert`, firmware placeholder docs | PLACEHOLDER |
| UC11 | FR16-FR19 | Xac nhan hoac huy canh bao | `backend/src/modules/alert-response`, firmware placeholder docs | PLACEHOLDER |
| UC12 | FR20-FR21 | Canh bao qua tin nhan | `backend/src/modules/notifications` | PLACEHOLDER |

## Placeholder Details

| Use Case | Module path | Entry point | TODO tiep theo | Dependency du kien |
|----------|-------------|-------------|----------------|--------------------|
| UC1 | `backend/src/modules/auth` | `index.js` | Replace dev-token adapter with production login/session flow. | Password hashing, session/JWT library, user store |
| UC2 | `backend/src/modules/sensor-data` | `index.js` | Add sensor payload validation and persistence. | Device transport, database table/collection |
| UC5 | `backend/src/modules/sos` | `index.js` | Record SOS events and trigger alert flow. | Device event channel, alert service |
| UC6 | `backend/src/modules/patient-location` | `index.js` | Store and authorize latest GPS reads. | GPS data store, map UI/provider if approved |
| UC8 | `backend/src/modules/cardiac-detection` | `index.js` | Compare incoming vitals with thresholds and create alerts. | Sensor ingestion, alert creation service |
| UC9 | `backend/src/modules/fall-detection`, `ai-service/src/modules/fall-inference` | `index.js` | Integrate real fall model and versioned inference contract. | Trained model artifact, model runtime |
| UC10 | `backend/src/modules/local-alert` | `index.js` | Send real local alert commands to device. | MQTT/device command channel |
| UC11 | `backend/src/modules/alert-response` | `index.js` | Process confirm/cancel button events and update alerts. | Device event channel, alert status store |
| UC12 | `backend/src/modules/notifications` | `index.js` | Send messages with retry policy and audit state. | SMS/email provider |

Placeholders do not claim conformance with their corresponding specs yet.
