# Verification phạm vi Hoàng Ngọc Tùng - Sprint 2-3

Ngày kiểm tra: 2026-07-23
Nhánh kiểm tra: `TungTungTung`
HEAD khi bắt đầu kiểm tra: `46290471 Update UC7, UC3, vẫn còn bug`

## 1. Phạm vi và nguyên tắc kiểm tra

Phạm vi gồm:

- Task 5.4: xây dựng giao diện ứng dụng.
- Task 5.9 / UC3 / FR4: xem thông tin tổng quát.
- Task 5.11 / UC4 / FR5: xem lịch sử cảnh báo.
- Task 6.1 / UC7 / FR9-FR11: hiệu chỉnh ngưỡng cá nhân.
- Task 6.2 / UC8 / FR12 / NFR1: phát hiện bất thường tim mạch bằng luật ngưỡng.

Lần kiểm tra này không thêm chức năng nghiệp vụ. Vòng bổ sung frontend verification chỉ thêm TypeScript/ESLint/Vitest configuration, test files và devDependencies/lockfile; production source không phải sửa để làm test pass.

Kiểm tra `git diff` trước khi chạy test cho thấy working tree đã có thay đổi chưa commit thuộc UC4, UC8 và các điểm tích hợp dùng chung. Không có diff trong:

- `ai-service`
- `iot-firmware`
- `database`
- `backend/src/modules/fall-detection`

Các điểm dùng chung có thay đổi nhưng cần thiết cho luồng UC8:

- `backend/src/modules/sensor-data`: chỉ nối HTTP sensor ingress với UC8, không triển khai transport thiết bị của UC2.
- `backend/src/modules/local-alert`: chỉ cung cấp event publisher/contract, không triển khai buzzer hoặc LED của UC10.
- `backend/src/modules/auth`: dùng lại Bearer dev adapter và kiểm tra phạm vi bệnh nhân.
- `backend/src/data/json-health.repository.js`: lưu reading/alert và chống trùng trong JSON repository.

Test không làm thay đổi `database/seed-data.json` hoặc file thuộc AI té ngã/firmware. Frontend lockfile chỉ thay đổi do cài các devDependencies kiểm thử đã được phê duyệt.

## 2. Verdict

**PASS trong phạm vi Tùng và các adapter/contract hiện tại**

Backend của UC3, UC4, UC7 và UC8 đạt 39/39 test. Frontend đạt 13/13 Vitest/React Testing Library test, ESLint, TypeScript typecheck và production build. Test frontend chặn tại `fetch` boundary, không sao chép logic nghiệp vụ vào fixture/test.

Production authentication, real device transport và buzzer/LED consumer vẫn là dependency của task thành viên khác. Kết quả PASS này không tuyên bố các dependency đó đã được triển khai.

## 3. Bảng trạng thái theo task

| Task | UC / FR / NFR | Trạng thái verification | Bằng chứng chính | Phần còn thiếu hoặc phụ thuộc |
|---|---|---|---|---|
| 5.4 | Application shell hỗ trợ UC3, UC4, UC6, UC7 | **PASS** | Route/navigation test và mobile navigation test pass; lint/typecheck/build pass | GPS data vẫn là placeholder của UC6 |
| 5.9 | UC3 / FR4 | **PASS** | 7 backend overview test và 6 frontend overview test pass: loading, success, abnormal contract, stale, empty, error | Production login/session vẫn phụ thuộc UC1 |
| 5.11 | UC4 / FR5 | **PASS** | 11 backend alert test và frontend list/detail/nullable cardiac alert test pass | Production login/session vẫn phụ thuộc UC1 |
| 6.1 | UC7 / FR9-FR11 | **PASS** | 8 backend threshold test và 4 frontend test pass: validation, save, failed persistence, restore confirmation | Production login/session vẫn phụ thuộc UC1 |
| 6.2 | UC8 / FR12 / NFR1 | **PASS** trong contract hiện tại | 12 backend test; frontend xác nhận abnormal status và `CARDIAC_ABNORMAL` nullable detail | Real device transport thuộc UC2; buzzer/LED consumer thuộc UC10 |

## 4. Traceability file, API và test

### 4.1 Task 5.4 - Giao diện ứng dụng

File triển khai chính:

- `frontend/Healthcare Dashboard UI Prototype/src/app/App.tsx`
- `frontend/Healthcare Dashboard UI Prototype/src/app/types.ts`
- `frontend/Healthcare Dashboard UI Prototype/src/app/adapters/authAdapter.ts`
- `frontend/Healthcare Dashboard UI Prototype/src/app/components/layout/DashboardLayout.tsx`
- `frontend/Healthcare Dashboard UI Prototype/src/app/components/layout/Sidebar.tsx`
- `frontend/Healthcare Dashboard UI Prototype/src/app/components/layout/TopHeader.tsx`
- `frontend/Healthcare Dashboard UI Prototype/src/app/components/layout/MobileNavigation.tsx`
- `frontend/Healthcare Dashboard UI Prototype/src/app/components/common/StateMessage.tsx`
- `frontend/Healthcare Dashboard UI Prototype/src/app/screens/LoginScreen.tsx`
- `frontend/Healthcare Dashboard UI Prototype/src/app/screens/PlaceholderRoutes.tsx`
- `frontend/Healthcare Dashboard UI Prototype/src/styles/theme.css`
- `frontend/Healthcare Dashboard UI Prototype/vite.config.ts`
- `frontend/Healthcare Dashboard UI Prototype/tsconfig.json`
- `frontend/Healthcare Dashboard UI Prototype/eslint.config.js`
- `frontend/Healthcare Dashboard UI Prototype/vitest.config.ts`
- `frontend/Healthcare Dashboard UI Prototype/test/app-navigation.test.tsx`
- `frontend/Healthcare Dashboard UI Prototype/test/overview.test.tsx`
- `frontend/Healthcare Dashboard UI Prototype/test/alert-history.test.tsx`
- `frontend/Healthcare Dashboard UI Prototype/test/settings.test.tsx`

Route hiện có:

| Màn hình | Route | Ghi chú |
|---|---|---|
| Đăng nhập | `/login` | Development adapter dùng Bearer dev token; production auth thuộc UC1 |
| Tổng quan | `/overview` | Màn hình UC3 |
| Lịch sử cảnh báo | `/alerts` | Màn hình UC4 |
| GPS | `/gps` | Có route/shell, dữ liệu GPS vẫn là placeholder UC6 |
| Cài đặt | `/settings` | Màn hình UC7 |
| SOS | `/sos` | Route có sẵn của prototype, chức năng là placeholder UC5 |

State UI dùng chung:

- `StateMessage` biểu diễn loading, empty, warning và error.
- Dashboard có loading, empty, stale-data và error/retry.
- Alert history có loading list/detail, empty, error/retry và chịu được field nullable.
- Settings có loading, empty, error/retry, saving/restoring và thông báo kết quả.
- Các action quan trọng dùng button có trạng thái disabled/loading; threshold form có lỗi cạnh field và hộp xác nhận.

Test liên quan:

- 13/13 frontend test pass trong 4 test files.
- Navigation test đi qua Overview, Alerts, GPS và Settings.
- Mobile viewport test xác nhận main mobile navigation và active state.
- Overview test bao phủ loading, success, backend abnormal status, stale, empty và API error.
- Alert test bao phủ list, selected detail, `CARDIAC_ABNORMAL` và nullable data.
- Settings test bao phủ `min >= max`, save thành công, backend save failure không đổi applied values và restore confirmation.
- ESLint và TypeScript typecheck pass.
- Production build transform thành công 2.308 module.
- Repository không dùng Playwright/Cypress; test UI hiện tại dùng Vitest/React Testing Library trên jsdom.

### 4.2 Task 5.9 - UC3 / FR4

File triển khai:

- `backend/src/modules/overview/index.js`
- `backend/src/modules/overview/overview.controller.js`
- `backend/src/modules/overview/overview.service.js`
- `backend/src/modules/overview/overview.types.js`
- `backend/src/config/overview.js`
- `backend/src/data/json-health.repository.js`
- `backend/src/modules/auth/auth.middleware.js`
- `frontend/Healthcare Dashboard UI Prototype/src/app/screens/HomeScreen.tsx`
- `frontend/Healthcare Dashboard UI Prototype/src/app/components/metrics/MetricCard.tsx`
- `frontend/Healthcare Dashboard UI Prototype/src/app/components/metrics/StatusTile.tsx`
- `frontend/Healthcare Dashboard UI Prototype/src/app/components/metrics/ThresholdCard.tsx`
- `frontend/Healthcare Dashboard UI Prototype/src/app/lib/metricStatus.ts`
- `frontend/Healthcare Dashboard UI Prototype/src/app/api.ts`
- `backend/test/api.test.js`

API:

`GET /api/overview?patientId=<id>`

- Bắt buộc `Authorization: Bearer <token>`.
- Nếu bỏ `patientId`, API dùng `primaryPatientId`.
- Chỉ cho phép `patientId` thuộc `accessiblePatientIds`.
- Response `200` trả `patient`, `latestMeasurement`, `recentMeasurements`, `thresholds`, `healthStatus`, `dataFreshness` và `alertCountToday`.
- `latestMeasurement` và `thresholds` có thể là `null`.
- Lỗi xác thực/phân quyền: `401 UNAUTHENTICATED` hoặc `403 FORBIDDEN`.
- Lỗi repository được trả dưới dạng lỗi JSON có cấu trúc.

Test trong suite `overview API`:

- Có dữ liệu và mapping heart rate/SpO2/timestamp/threshold/status.
- Không có measurement.
- Dữ liệu cũ.
- Dữ liệu vượt ngưỡng.
- Không đăng nhập.
- Không có quyền với bệnh nhân.
- Repository truy vấn lỗi.

Kết quả: **7/7 test pass**.

### 4.3 Task 5.11 - UC4 / FR5

File triển khai:

- `backend/src/modules/alert-history/index.js`
- `backend/src/modules/alert-history/alert-history.controller.js`
- `backend/src/modules/alert-history/alert-history.service.js`
- `backend/src/modules/alert-history/alert-history.types.js`
- `backend/src/data/json-health.repository.js`
- `backend/src/modules/auth/auth.middleware.js`
- `frontend/Healthcare Dashboard UI Prototype/src/app/screens/AlertHistoryScreen.tsx`
- `frontend/Healthcare Dashboard UI Prototype/src/app/components/common/DetailCell.tsx`
- `frontend/Healthcare Dashboard UI Prototype/src/app/api.ts`
- `backend/test/api.test.js`

API:

`GET /api/alerts?patientId=<id>`

- Bắt buộc Bearer authentication và patient scope.
- Trả mảng alert của đúng bệnh nhân.
- Sắp xếp giảm dần theo `occurredAt`; dùng `createdAt` làm fallback.
- Repository chưa có pagination convention nên endpoint giữ array response hiện có.

`GET /api/alerts/:id`

- Bắt buộc Bearer authentication.
- Trả `id`, `type`, `severity`, `status`, `message`, `occurredAt`, `heartRate`, `spo2`, `fallProbability`.
- Field chi tiết thiếu được chuẩn hóa thành `null`.
- Trả `404 ALERT_NOT_FOUND` nếu không tồn tại và `403 FORBIDDEN` nếu alert không thuộc patient scope.

Test trong suite `alerts API`:

- Danh sách thành công.
- Mới nhất trước.
- Detail đúng ID.
- Field nullable.
- Fallback `createdAt`.
- Alert không tồn tại.
- Danh sách rỗng.
- Không đăng nhập.
- Không có quyền xem detail/list.
- Repository truy vấn lỗi.

Kết quả: **11/11 test pass**.

### 4.4 Task 6.1 - UC7 / FR9-FR11

File triển khai:

- `backend/src/config/thresholds.js`
- `backend/src/modules/personal-thresholds/index.js`
- `backend/src/modules/personal-thresholds/personal-thresholds.controller.js`
- `backend/src/modules/personal-thresholds/personal-thresholds.service.js`
- `backend/src/modules/personal-thresholds/personal-thresholds.types.js`
- `backend/src/data/json-health.repository.js`
- `backend/src/modules/auth/auth.middleware.js`
- `frontend/Healthcare Dashboard UI Prototype/src/app/screens/SettingsScreen.tsx`
- `frontend/Healthcare Dashboard UI Prototype/src/app/components/thresholds/ThresholdForm.tsx`
- `frontend/Healthcare Dashboard UI Prototype/src/app/components/ui/alert-dialog.tsx`
- `frontend/Healthcare Dashboard UI Prototype/src/app/api.ts`
- `backend/test/api.test.js`

API:

`GET /api/personal-thresholds?patientId=<id>`

- Chỉ caregiver đã xác thực và có patient scope.
- Trả `thresholds` hiện tại và `limits` cấu hình của hệ thống.

`PUT /api/personal-thresholds?patientId=<id>`

Request:

```json
{
  "heartRateMin": 55,
  "heartRateMax": 105,
  "spo2Min": 94,
  "spo2Max": 100
}
```

- Cả bốn field phải là finite number.
- Mỗi min phải nhỏ hơn max.
- Giá trị phải nằm trong system limits.
- Validation lỗi trả `400 VALIDATION_ERROR` và `error.fields`.
- UI chỉ cập nhật state đang áp dụng sau khi backend trả thành công.

`POST /api/personal-thresholds/restore-defaults?patientId=<id>`

- Khôi phục operational defaults trong `backend/src/config/thresholds.js`.
- Default và system limits có thể override bằng biến môi trường `CAREWATCH_*`.
- Các giá trị này là cấu hình vận hành, không phải khuyến nghị y tế.

Test trong suite `personal thresholds API`:

- Lấy ngưỡng hiện tại.
- Cập nhật hợp lệ và kiểm tra persisted value.
- `min >= max`.
- Dữ liệu không phải số.
- Ngoài system limits.
- Sai patient scope.
- User không phải caregiver.
- Khôi phục default.

Kết quả: **8/8 test pass**.

### 4.5 Task 6.2 - UC8 / FR12 / NFR1

File triển khai:

- `backend/src/modules/cardiac-detection/index.js`
- `backend/src/modules/cardiac-detection/cardiac-detection.controller.js`
- `backend/src/modules/cardiac-detection/cardiac-detection.service.js`
- `backend/src/modules/cardiac-detection/cardiac-detection.evaluator.js`
- `backend/src/modules/cardiac-detection/cardiac-detection.validation.js`
- `backend/src/modules/cardiac-detection/cardiac-detection.types.js`
- `backend/src/modules/sensor-data/index.js`
- `backend/src/modules/sensor-data/sensor-data.types.js`
- `backend/src/modules/local-alert/local-alert-event.publisher.js`
- `backend/src/modules/local-alert/local-alert.types.js`
- `backend/src/observability/structured-logger.js`
- `backend/src/data/json-health.repository.js`
- `backend/src/server.js`
- `backend/test/cardiac-detection.test.js`

API:

`POST /api/sensor-data` là sensor ingress chính.
`POST /api/cardiac-detection/evaluate` là alias dùng cùng handler.

Request:

```json
{
  "id": "READING_123",
  "patientId": "PATIENT_DEMO_001",
  "heartRate": 110,
  "spo2": 97,
  "measuredAt": "2026-07-23T08:00:00.000Z"
}
```

- Bắt buộc Bearer authentication và patient scope.
- Validate/normalize ID, patient ID, finite numeric metrics và timestamp.
- Đọc persisted personal thresholds của đúng bệnh nhân.
- Boundary bằng min hoặc max được coi là `NORMAL`.
- Reading bất thường tạo tối đa một alert `CARDIAC_ABNORMAL`, liên kết bằng `readingId`.
- ID alert deterministic và serialized repository mutation chống alert trùng khi gửi lại cùng reading.
- Alert mới phát đúng một event `CARDIAC_ABNORMALITY_CONFIRMED`.
- Không điều khiển buzzer/LED và không gọi AI fall detection.
- Alert mới/reading mới trả `201`; reading trùng trả `200`.
- Lỗi dữ liệu trả `400 VALIDATION_ERROR`.
- Thiếu thresholds trả `422 THRESHOLDS_NOT_FOUND`.
- Response thành công có `processingTimeMs` và `nfr1Met`.

Test:

- Heart rate dưới min.
- Heart rate trên max.
- SpO2 dưới min.
- Đúng boundary.
- Tất cả chỉ số bình thường.
- Dữ liệu thiếu/không hợp lệ.
- Không có thresholds.
- Normal reading không tạo alert.
- Alert lưu đúng patient, reading, type và timestamp.
- Không tạo alert trùng.
- Local event đúng một lần.
- Structured error log không chứa dữ liệu nhạy cảm.
- HTTP request được xác thực và hoàn tất trong NFR1.

Kết quả: **12/12 test pass**.

Đo NFR1:

- Test dùng `performance.now()` bao quanh HTTP request.
- API cũng đo monotonic duration từ đầu controller qua auth, validation, threshold lookup, persistence và event publication.
- Test assert cả `payload.data.processingTimeMs <= 2000` và HTTP round-trip `<= 2000`.
- Lần integration run này, case NFR1 hoàn tất trong **54,2323 ms**, nhỏ hơn 2.000 ms.
- Đây là kết quả trên môi trường local với JSON repository, không thay thế load/performance test trên hạ tầng production.

## 5. Lệnh kiểm tra và kết quả thực tế

Các lệnh được chạy từ repository hiện tại. Frontend devDependencies kiểm thử được cài theo phạm vi đã phê duyệt.

| Khu vực | Lệnh | Kết quả thực tế |
|---|---|---|
| Git | `git status --short` | Working tree có thay đổi UC4/UC8 đã tồn tại trước verification và tài liệu verification mới |
| Git | `git diff --name-status` | Không thấy diff ở AI fall detection, firmware hoặc database seed |
| Git | `git diff --check` | Exit 0; có cảnh báo LF sẽ đổi thành CRLF khi Git chạm file |
| Backend full test | `cd backend; npm test` | **PASS**, 39 test, 6 suite, 0 fail |
| Integration | `cd backend; node --test test/api.test.js test/cardiac-detection.test.js` | **PASS**, 39 test, 6 suite, 0 fail; hai file này cũng chính là toàn bộ test suite hiện có nên kết quả có overlap với `npm test` |
| Backend build | `cd backend; npm run build` | **PASS** |
| Backend lint script | `cd backend; npm run lint` | **PASS**, nhưng script package chỉ `node --check src/server.js` |
| Backend supplemental syntax | Chạy `node --check` cho mọi file `.js` trong `backend/src` và `backend/test` | **PASS**, 48 file |
| Frontend test | `cd "frontend/Healthcare Dashboard UI Prototype"; npm test` | **PASS**, 13 test, 4 files, 0 fail |
| Frontend lint | `cd "frontend/Healthcare Dashboard UI Prototype"; npm run lint` | **PASS**, exit 0, `eslint src test --max-warnings=0` |
| Frontend typecheck | `cd "frontend/Healthcare Dashboard UI Prototype"; npm run typecheck` | **PASS**, exit 0, `tsc --noEmit` |
| Frontend production build | `cd "frontend/Healthcare Dashboard UI Prototype"; npm run build` | **PASS**, Vite 6.3.5, 2.308 module; cảnh báo non-fatal vì JS chunk 687,52 kB > 500 kB |
| UI integration | Vitest + React Testing Library + jsdom, mock `fetch` boundary | **PASS**, route/mobile/overview/alert/settings/UC8-related UI covered |
| AI regression build/lint | `cd ai-service; npm run build; npm run lint` | **PASS**; không sửa AI service |

## 6. Dependency với task thành viên khác

| Dependency | Ảnh hưởng tới phạm vi Tùng | Trạng thái hiện tại |
|---|---|---|
| UC1 / FR1 - production authentication | UC3, UC4, UC7, UC8 cần user đăng nhập | Hiện dùng Bearer dev token/repository adapter; production login endpoint vẫn trả 501 |
| UC2 / FR2-FR3 - device collection/transport | UC8 cần reading thật từ wearable | Có HTTP ingress tối thiểu; firmware transport và cadence chưa triển khai |
| UC6 / FR8 - GPS | Task 5.4 cần route/màn hình GPS | Shell/route có, dữ liệu GPS vẫn placeholder |
| UC10 / FR15 - local buzzer/LED | UC8 cần phát tín hiệu cho consumer | Event contract/publisher có; hardware consumer chưa triển khai |
| UC9 / FR13-FR14 - fall detection | Không thuộc UC8 cardiac threshold rules | Không sửa và không gọi AI fall detection |
| Database production | UC3/UC4/UC7/UC8 cần persistence | Hiện dùng `database/seed-data.json`, chưa có DB server/ORM |

Các dependency trên không được triển khai lại trong phạm vi Tùng. Chúng là giới hạn khi demo end-to-end với thiết bị và production auth, nhưng không chặn unit/API integration hiện tại.

## 7. Kịch bản demo ngắn cho chức năng của Tùng

Thực hiện trên dữ liệu development hoặc bản sao repository vì bước cập nhật ngưỡng và gửi reading sẽ ghi vào JSON repository.

1. Chạy backend:

   ```powershell
   Set-Location backend
   npm start
   ```

2. Ở terminal khác, chạy frontend:

   ```powershell
   Set-Location "frontend/Healthcare Dashboard UI Prototype"
   npm run dev
   ```

3. Mở `/login`, nhập hai trường không rỗng trong development mode.
4. Vào **Tổng quan**:
   - chỉ ra HR theo BPM, SpO2 theo `%`, timestamp mới nhất;
   - chỉ ra trạng thái normal/abnormal, freshness/device status và ngưỡng cá nhân;
   - mô tả rõ empty/error/stale state bằng code/test nếu không chủ động thay fixture.
5. Vào **Cài đặt**:
   - xem bốn ngưỡng hiện tại;
   - thử đặt min bằng max để thấy lỗi cạnh field và không lưu;
   - cập nhật bộ hợp lệ, xác nhận lưu, sau đó tải lại để chứng minh persisted value;
   - mở hộp xác nhận và khôi phục default.
6. Gửi một reading bất thường bằng API development, dùng ID duy nhất:

   ```powershell
   $headers = @{
     Authorization = "Bearer dev-caregiver-token"
     "Content-Type" = "application/json"
   }
   $body = @{
     id = "DEMO_TUNG_001"
     patientId = "PATIENT_DEMO_001"
     heartRate = 110
     spo2 = 97
     measuredAt = (Get-Date).ToUniversalTime().ToString("o")
   } | ConvertTo-Json
   Invoke-RestMethod -Method Post -Uri "http://localhost:3001/api/sensor-data" -Headers $headers -Body $body
   ```

   Giá trị demo phải được chọn dựa trên ngưỡng vừa lưu để chắc chắn vượt ngưỡng nhưng vẫn nằm trong system limits.

7. Mở **Lịch sử cảnh báo**, kiểm tra alert mới nằm đầu danh sách, mở rộng detail và đối chiếu type, timestamp, HR/SpO2.
8. Gửi lại đúng `id` reading và xác nhận response `duplicate: true`, không có alert/event thứ hai.
9. Kết thúc demo bằng khôi phục default nếu muốn trả ngưỡng về cấu hình development ban đầu.

## 8. Dependency còn lại và cải tiến tùy chọn

Các hạng mục dưới đây không thuộc phạm vi triển khai của Tùng trong lượt này:

1. Task 5.13: thay dev authentication adapter bằng production authentication/session.
2. Task 5.7: nối real device transport vào sensor ingress contract.
3. Task 6.4: nối buzzer/LED consumer vào local-alert event contract.
4. Có thể bổ sung Playwright/Cypress real-browser smoke test nếu nhóm yêu cầu mức E2E cao hơn jsdom component integration.
5. Có thể code-split frontend để xử lý cảnh báo bundle lớn hơn 500 kB.
