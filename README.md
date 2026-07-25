# CareWatch - Hệ thống giám sát tim mạch và phát hiện té ngã

README này dành cho thành viên trong nhóm cần cài đặt, chạy thử, kiểm tra hoặc tiếp tục phát triển project.

> **Lưu ý quan trọng:** project hiện là bản development, chưa phải thiết bị y tế và chưa sẵn sàng triển khai production. Không dùng dữ liệu hoặc kết quả của hệ thống để chẩn đoán hay đưa ra quyết định y khoa.

## 1. Đọc nhanh trước khi bắt đầu

Project gồm bốn phần chính:

- Frontend React hiển thị dữ liệu sức khỏe và cảnh báo.
- Backend Node.js cung cấp API và xử lý luật phát hiện bất thường tim mạch.
- AI service dự kiến dùng để phát hiện té ngã.
- Firmware ESP32-S3 dự kiến thu thập dữ liệu cảm biến và điều khiển cảnh báo tại thiết bị.

### Trạng thái hiện tại

| Use case | Chức năng | Trạng thái |
|---|---|---|
| UC1 | Đăng nhập production | Chưa hoàn thành; hiện dùng development token |
| UC2 | Thu thập dữ liệu cảm biến | Một phần; backend nhận HTTP nhưng firmware chưa gửi dữ liệu thật |
| UC3 | Xem thông tin tổng quan | Đã có frontend, backend và test |
| UC4 | Xem lịch sử/chi tiết cảnh báo | Đã có frontend, backend và test |
| UC5 | SOS | Placeholder |
| UC6 | GPS/vị trí bệnh nhân | Placeholder |
| UC7 | Cấu hình ngưỡng cá nhân | Đã có frontend, backend và test |
| UC8 | Phát hiện bất thường tim mạch | Có luật ngưỡng tại backend; chưa nối cảnh báo phần cứng |
| UC9 | Phát hiện té ngã bằng AI | Placeholder; chưa có model |
| UC10 | Buzzer/LED cảnh báo cục bộ | Placeholder |
| UC11 | Xác nhận/hủy cảnh báo | Placeholder |
| UC12 | Gửi tin nhắn cho người giám hộ | Placeholder |

Không đánh dấu một chức năng là hoàn thành chỉ vì đã có tên file, route hoặc dữ liệu seed. Các route placeholder trả HTTP `501 FEATURE_NOT_IMPLEMENTED`.

## 2. Cấu trúc repository

```text
.
├── ai-service/       # AI fall-detection service; hiện là scaffold
├── backend/          # Node.js API, business logic và test
├── database/         # JSON repository dùng trong development
├── docs/             # Architecture, trạng thái, verification và audit
├── frontend/         # React/Vite dashboard
├── iot-firmware/     # ESP-IDF firmware cho ESP32-S3
├── Specs_Final.pdf   # Đặc tả yêu cầu phiên bản 2.1
└── README.md         # Hướng dẫn này
```

Các tài liệu nên đọc:

1. [`Specs_Final.pdf`](Specs_Final.pdf) - yêu cầu chính thức của hệ thống.
2. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - kiến trúc và API contract hiện tại.
3. [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md) - ranh giới implemented/placeholder.
4. [`docs/PROJECT_COMPLETENESS_AUDIT.md`](docs/PROJECT_COMPLETENESS_AUDIT.md) - các phần còn thiếu và thứ tự ưu tiên.
5. [`docs/TUNG_SPRINT_2_3_VERIFICATION.md`](docs/TUNG_SPRINT_2_3_VERIFICATION.md) - bằng chứng test và demo của phần UC3, UC4, UC7, UC8.

## 3. Yêu cầu môi trường

### Web/backend

- Git.
- Node.js `>=18`.
- npm đi kèm Node.js.
- Hai terminal trở lên để chạy backend và frontend.

Phiên bản đã được kiểm tra gần nhất:

- Node.js 24.11.0.
- npm 11.6.1.
- Vite 6.3.5.

### Firmware

- ESP-IDF.
- Target `esp32s3`.
- Board ESP32-S3 và các linh kiện tương ứng.
- Cáp USB hỗ trợ data.

`iot-firmware/dependencies.lock` hiện ghi ESP-IDF `6.0.2`. Khi setup môi trường mới, ưu tiên dùng phiên bản khớp lockfile. Không tự ý cập nhật lockfile hoặc dependency firmware nếu chưa trao đổi với nhóm.

### Phần cứng dự kiến theo Specs

- ESP32-S3 N16R8.
- MAX30102 cho nhịp tim và SpO2.
- MPU6050 cho gia tốc và con quay hồi chuyển.
- NEO-6M GPS.
- OLED, buzzer, LED và nút nhấn.

Hiện source chỉ có driver MPU6050 và Wi-Fi provisioning; các phần còn lại chưa được tích hợp hoàn chỉnh.

## 4. Chạy nhanh frontend và backend

Các lệnh dưới đây dùng PowerShell trên Windows.

### Bước 1: mở repository

```powershell
Set-Location "D:\duong-dan-den-project\aiot-cardiac-fall-detection"
git status --short
```

Không tiếp tục nếu thấy thay đổi lạ mà bạn chưa hiểu. Hỏi người tạo thay đổi trước khi sửa hoặc xóa file.

### Bước 2: tạo database development tạm

Backend mặc định ghi trực tiếp vào `database/seed-data.json`. Để không làm thay đổi dữ liệu chung, hãy chạy backend với một bản sao trong thư mục tạm:

```powershell
$carewatchDb = Join-Path $env:TEMP ("carewatch-dev-{0}.json" -f (Get-Date -Format "yyyyMMdd-HHmmss"))
Copy-Item ".\database\seed-data.json" $carewatchDb
```

Giữ terminal này để chạy backend:

```powershell
Set-Location ".\backend"
$env:CAREWATCH_DB_PATH = $carewatchDb
npm install
npm start
```

Backend mặc định chạy tại:

```text
http://localhost:3001
```

Kiểm tra health endpoint:

```powershell
Invoke-RestMethod "http://localhost:3001/api/health"
```

Kết quả mong đợi:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

### Bước 3: chạy frontend

Mở terminal khác tại repository:

```powershell
Set-Location ".\frontend\Healthcare Dashboard UI Prototype"
Copy-Item ".env.example" ".env" -ErrorAction SilentlyContinue
npm install
npm run dev
```

Mở URL Vite in ra terminal, mặc định thường là:

```text
http://localhost:5173
```

Trong development mode:

- Có thể nhập username và password bất kỳ miễn là không để trống.
- Frontend dùng token mặc định `dev-caregiver-token`.
- Token này chỉ dành cho development, không được dùng cho production.

### Bước 4: kiểm tra các màn hình

Sau khi đăng nhập:

1. Mở **Tổng quan** để xem nhịp tim, SpO2, trạng thái thiết bị và ngưỡng.
2. Mở **Lịch sử cảnh báo** và chọn một alert để xem chi tiết.
3. Mở **Cài đặt** để xem/cập nhật/khôi phục ngưỡng.
4. GPS và SOS hiện phải hiển thị trạng thái đang phát triển, không phải dữ liệu thật.

## 5. Chạy AI service

```powershell
Set-Location ".\ai-service"
npm install
npm start
```

AI service mặc định chạy tại:

```text
http://localhost:3101
```

Endpoint hiện tại:

```text
POST /api/fall-inference
```

Endpoint này đang trả HTTP 501 vì chưa có model, preprocessing hoặc inference thật. Không dùng response này để demo rằng UC9 đã hoàn thành.

## 6. Biến môi trường

### Frontend

Tạo `.env` từ `.env.example`. File `.env` đã được Git ignore.

| Biến | Mặc định/ý nghĩa |
|---|---|
| `VITE_API_BASE_URL` | Để trống khi dùng Vite proxy tới backend `localhost:3001` |
| `VITE_USE_DEV_AUTH` | `true` để dùng development login |
| `VITE_DEV_AUTH_TOKEN` | `dev-caregiver-token` |

Muốn thử production login adapter:

```env
VITE_USE_DEV_AUTH=false
```

Hiện production login sẽ thất bại với HTTP 501 vì UC1 chưa được triển khai.

### Backend

| Biến | Mặc định |
|---|---|
| `PORT` | `3001` |
| `CAREWATCH_DB_PATH` | `database/seed-data.json` |
| `CAREWATCH_OVERVIEW_STALE_AFTER_MINUTES` | `15` |
| `CAREWATCH_HEART_RATE_LIMIT_MIN` | `1` |
| `CAREWATCH_HEART_RATE_LIMIT_MAX` | `300` |
| `CAREWATCH_SPO2_LIMIT_MIN` | `0` |
| `CAREWATCH_SPO2_LIMIT_MAX` | `100` |
| `CAREWATCH_DEFAULT_HEART_RATE_MIN` | `60` |
| `CAREWATCH_DEFAULT_HEART_RATE_MAX` | `100` |
| `CAREWATCH_DEFAULT_SPO2_MIN` | `95` |
| `CAREWATCH_DEFAULT_SPO2_MAX` | `100` |

Các giá trị default là cấu hình vận hành cho demo, không phải khuyến nghị y khoa.

### AI service

| Biến | Mặc định |
|---|---|
| `AI_SERVICE_PORT` | `3101` |

## 7. API contract hiện tại

Các API cần Bearer token sử dụng header:

```http
Authorization: Bearer dev-caregiver-token
```

| Method | Endpoint | Trạng thái |
|---|---|---|
| GET | `/api/health` | Hoạt động |
| POST | `/api/auth/login` | Placeholder 501 |
| GET | `/api/overview` | Hoạt động |
| GET | `/api/alerts` | Hoạt động |
| GET | `/api/alerts/:id` | Hoạt động |
| GET | `/api/personal-thresholds` | Hoạt động |
| PUT | `/api/personal-thresholds` | Hoạt động |
| POST | `/api/personal-thresholds/restore-defaults` | Hoạt động |
| POST | `/api/sensor-data` | Hoạt động ở mức HTTP development adapter |
| POST | `/api/cardiac-detection/evaluate` | Hoạt động với cùng pipeline sensor data |
| POST | `/api/sos` | Placeholder 501 |
| GET | `/api/patient-location` | Placeholder 501 |
| POST | `/api/fall-detection/evaluate` | Placeholder 501 |
| POST | `/api/local-alerts` | Placeholder 501 |
| POST | `/api/alert-responses` | Placeholder 501 |
| POST | `/api/notifications` | Placeholder 501 |

### Sensor/cardiac payload

```json
{
  "id": "READING_UNIQUE_ID",
  "patientId": "PATIENT_DEMO_001",
  "heartRate": 110,
  "spo2": 97,
  "measuredAt": "2026-07-25T08:00:00.000Z"
}
```

Quy tắc:

- `id` phải khác nhau cho từng reading.
- `patientId` phải thuộc phạm vi token đang dùng.
- `heartRate` và `spo2` phải là số hữu hạn trong giới hạn hệ thống.
- `measuredAt` phải là timestamp hợp lệ.
- Giá trị bằng đúng min/max được coi là trong ngưỡng bình thường.

> **Cảnh báo P0:** repository hiện có lỗi khi hai bệnh nhân dùng trùng `reading.id`, có thể trả dữ liệu sai bệnh nhân. Không dùng ID tái sử dụng và phải sửa lỗi này trước khi tích hợp production.

### Gửi reading bất thường bằng PowerShell

Chỉ chạy khi backend đang dùng database tạm:

```powershell
$headers = @{
  Authorization = "Bearer dev-caregiver-token"
  "Content-Type" = "application/json"
}

$body = @{
  id = "TEAM_DEMO_$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
  patientId = "PATIENT_DEMO_001"
  heartRate = 110
  spo2 = 97
  measuredAt = (Get-Date).ToUniversalTime().ToString("o")
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3001/api/sensor-data" `
  -Headers $headers `
  -Body $body
```

Chọn giá trị dựa trên ngưỡng hiện tại. Nếu `heartRate=110` vẫn nằm trong ngưỡng đã cấu hình, request sẽ không tạo alert.

## 8. Chạy test, lint và build

### Backend

```powershell
Set-Location ".\backend"
npm test
npm run lint
npm run build
```

Kỳ vọng hiện tại:

- 39 test pass.
- `lint` hiện chỉ chạy syntax check cho `src/server.js`.
- Backend chưa có script typecheck.

Backend test dùng repository giả hoặc database tạm, không được thay đổi seed chung.

### Frontend

```powershell
Set-Location ".\frontend\Healthcare Dashboard UI Prototype"
npm test
npm run lint
npm run typecheck
npm run build
```

Kỳ vọng hiện tại:

- 13 test pass trong 4 test file.
- Lint và typecheck pass.
- Build pass nhưng có thể cảnh báo JS bundle lớn hơn 500 kB.
- Chưa có Playwright/Cypress E2E suite trong repository.

### AI service

```powershell
Set-Location ".\ai-service"
npm run lint
npm run build
```

AI service chưa có test script hoặc model test. Build pass chỉ chứng minh scaffold import được.

### Trước khi bàn giao task

Chạy ít nhất các command liên quan đến phần đã sửa và ghi lại:

- Lệnh đã chạy.
- Exit code.
- Số test pass/fail/skip.
- Warning còn lại.
- Phạm vi thực sự được test.

Không ghi “đã hoàn thành” nếu chỉ build pass nhưng feature vẫn trả 501 hoặc chưa tích hợp.

## 9. Firmware ESP32-S3

### Build cơ bản

Mở ESP-IDF PowerShell hoặc terminal đã export ESP-IDF:

```powershell
Set-Location ".\iot-firmware"
idf.py set-target esp32s3
idf.py reconfigure
idf.py build
```

Flash và theo dõi serial:

```powershell
idf.py -p COMx flash monitor
```

Thay `COMx` bằng cổng thật của board. Thoát monitor bằng tổ hợp phím do ESP-IDF hiển thị.

Nếu gặp:

```text
idf.py is not recognized
```

thì terminal chưa được kích hoạt môi trường ESP-IDF. Mở **ESP-IDF PowerShell** hoặc chạy script export của bản ESP-IDF đã cài.

### Trạng thái source firmware

- Target: ESP32-S3.
- Có driver MPU6050.
- Có Wi-Fi SoftAP provisioning.
- `iot-firmware/main/main.c` đang rỗng.
- `app_main()` hiện nằm trong component network provisioning.
- Chưa có MAX30102, GPS, buzzer/LED/OLED, SOS, payload backend, offline buffer hoặc AI inference.

### Cảnh báo bảo mật firmware

Code provisioning hiện:

- Log SSID và password Wi-Fi.
- Hard-code Proof-of-Possession là `abcd1234`.

Phải loại bỏ hai hành vi này trước khi dùng ngoài môi trường development.

### Khi thêm module firmware

Mỗi module cần ghi rõ:

- Pin và bus sử dụng.
- Tần suất sampling.
- Đơn vị đo và range hợp lệ.
- Timestamp.
- Device ID và patient mapping.
- Payload gửi backend.
- Retry/reconnect/offline behavior.
- Cách build, flash và xác nhận trên thiết bị thật.

Không chỉ thêm driver rồi đánh dấu UC hoàn thành; phải nối driver vào `app_main`/task, gửi dữ liệu và có bằng chứng chạy.

## 10. Quy tắc làm việc cho teammate

### Trước khi code

1. Đọc UC/FR/NFR tương ứng trong Specs.
2. Kiểm tra [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md).
3. Kiểm tra dependency giữa frontend, backend, AI và firmware.
4. Chạy `git status --short` và không ghi đè thay đổi của người khác.
5. Xác định API/payload trước khi mỗi người sửa một component riêng.
6. Dùng database tạm nếu test có thể ghi dữ liệu.

### Branch và commit

Nên dùng một branch cho một task, ví dụ:

```text
feature/uc9-fall-inference
feature/uc6-gps
fix/uc8-reading-isolation
docs/team-onboarding
```

Trước khi commit:

```powershell
git status --short
git diff --stat
git diff --name-only
```

Không commit:

- `.env` hoặc secret.
- `node_modules/`.
- `dist/`, `build/`, `.vite/`, coverage.
- Database tạm.
- Log chứa token, password, dữ liệu sức khỏe hoặc vị trí nhạy cảm.
- Model/dataset không rõ giấy phép hoặc nguồn gốc.

### Khi thay đổi API

Phải kiểm tra và cập nhật đồng bộ:

1. Backend route/controller/service.
2. Frontend API type/client.
3. AI input/output contract nếu liên quan.
4. Firmware payload nếu liên quan.
5. Test/fixture.
6. Architecture/status documentation.

Không đổi tên field riêng ở một component. Hiện fall contract đã có lệch tên `acceleration` và `accelerometer`; cần thống nhất trước khi tích hợp.

### Khi hoàn thành task

Bàn giao tối thiểu:

- UC/FR/NFR đã xử lý.
- Danh sách file thay đổi.
- API hoặc hardware contract.
- Lệnh test/build và kết quả.
- Cách demo.
- Dữ liệu demo cần dùng.
- Dependency/blocker còn lại.
- Ảnh/video/serial log nếu là phần cứng.

## 11. Dữ liệu development

File mặc định:

```text
database/seed-data.json
```

Các collection hiện có:

- `users`
- `patients`
- `healthMeasurements`
- `personalThresholds`
- `alerts`

Development user:

```text
Token: dev-caregiver-token
Primary patient: PATIENT_DEMO_001
Role: caregiver
```

Một số alert FALL/SOS trong seed là dữ liệu demo, không chứng minh UC5/UC9 đã chạy thật.

Nếu cần reset dữ liệu trong một phiên làm việc, dừng backend và tạo lại bản sao tạm từ seed. Không sửa seed chung chỉ để làm demo pass.

## 12. Lỗi thường gặp

| Hiện tượng | Nguyên nhân có thể | Cách kiểm tra |
|---|---|---|
| Frontend báo không kết nối server | Backend chưa chạy hoặc sai API URL | Mở `/api/health`, kiểm tra `VITE_API_BASE_URL` |
| API trả 401 | Thiếu/sai Bearer token | Dùng `dev-caregiver-token` trong development |
| API trả 403 | Token không được phép truy cập patient | Kiểm tra `accessiblePatientIds` |
| API trả 501 | Feature là placeholder | Xem `IMPLEMENTATION_STATUS.md`, không sửa UI để che lỗi |
| Overview báo dữ liệu cũ | `measuredAt` đã vượt stale threshold | Gửi reading mới vào database tạm |
| Update threshold làm đổi seed | Backend đang dùng DB mặc định | Đặt `CAREWATCH_DB_PATH` tới bản sao tạm |
| Port 3001/3101/5173 bận | Process cũ chưa dừng | Kiểm tra process/port rồi dừng đúng process |
| `idf.py` không được nhận diện | ESP-IDF chưa cài hoặc chưa export | Mở ESP-IDF PowerShell |
| Firmware dependency thay đổi bất ngờ | Manifest và lockfile không đồng bộ | Không commit lock mới trước khi review |
| AI endpoint luôn trả 501 | Chưa có model/inference | Đây là trạng thái hiện tại, không phải lỗi setup |

## 13. Ưu tiên hiện tại

Thứ tự khuyến nghị:

1. Sửa lỗi cross-patient khi trùng reading ID.
2. Hoàn thiện production authentication và route protection.
3. Khôi phục môi trường build firmware.
4. Nối MAX30102/MPU6050 với backend bằng contract thống nhất.
5. Xây dựng model fall detection và evaluation có thể chạy lại.
6. Hoàn thiện local alert, confirm/cancel và notification.
7. Hoàn thiện SOS và GPS.
8. Bổ sung E2E, load, offline, security và hardware test.
9. Cập nhật Specs, Plan, Slides và tài liệu demo theo code cuối.

Danh sách đầy đủ xem tại [`docs/PROJECT_COMPLETENESS_AUDIT.md`](docs/PROJECT_COMPLETENESS_AUDIT.md).

## 14. Checklist onboarding

Teammate mới có thể bắt đầu làm khi hoàn thành checklist:

- [ ] Đọc Specs và tài liệu architecture/status.
- [ ] Cài Node.js và npm.
- [ ] Chạy backend bằng database tạm.
- [ ] Chạy frontend và mở Overview.
- [ ] Chạy được backend test.
- [ ] Chạy được frontend test/lint/typecheck/build.
- [ ] Hiểu route nào hoạt động và route nào trả 501.
- [ ] Xác định UC/FR đang nhận và dependency liên quan.
- [ ] Thống nhất API/payload với người làm component khác.
- [ ] Biết cách bàn giao test, demo và blocker.

Nếu một bước không chạy được, ghi lại **lệnh, exit code và thông báo lỗi đầy đủ** rồi gửi cho nhóm; không bỏ qua lỗi và không tự cài thêm framework để né contract hiện tại.
