# Project Completeness Audit

**Ngày audit:** 2026-07-25 (Asia/Bangkok)  
**Phạm vi:** toàn bộ repository tại commit `3bdc468f9044e3b041a21e630af31fc7e6a77ec7`, branch `TungTungTung`  
**Nguyên tắc:** chỉ công nhận khi có bằng chứng từ tài liệu, code, test hoặc chạy thử; placeholder và dữ liệu seed không được coi là chức năng đã hoàn thành.

## 1. Executive Summary

**Verdict toàn project: NOT READY.**

Các phần UC3/FR4 (Overview), UC4/FR5 (Alert History), UC7/FR9-FR11 (ngưỡng cá nhân) và lõi luật ngưỡng của FR12 chạy được ở frontend/backend development. Tuy nhiên, luồng end-to-end cốt lõi của đồ án AI & IoT chưa thể hoàn thành: production login chưa có; firmware chưa thu thập/gửi HR, SpO2, GPS hoặc chuyển động; AI fall detection chỉ trả 501; SOS, local buzzer/LED, xác nhận/hủy và gửi tin nhắn đều là placeholder.

### Tổng trạng thái traceability

Phép đếm dưới đây áp dụng cho **48 dòng yêu cầu** được audit độc lập: 12 UC + 21 FR + 15 NFR. Không cộng các lệnh build/test vào phép đếm để tránh trùng.

| Nhóm | PASS | PARTIAL | MISSING | BLOCKED | Tổng |
|---|---:|---:|---:|---:|---:|
| Use Case (UC1-UC12) | 3 | 2 | 7 | 0 | 12 |
| Functional Requirement (FR1-FR21) | 6 | 2 | 13 | 0 | 21 |
| Non-functional Requirement (NFR1-NFR15) | 0 | 5 | 10 | 0 | 15 |
| **Tổng** | **9** | **9** | **30** | **0** | **48** |

Firmware build là một **verification BLOCKED** riêng do môi trường thiếu `idf.py`; việc này không đổi các requirement đã có bằng chứng là MISSING/PARTIAL thành BLOCKED.

### Năm vấn đề nghiêm trọng nhất

1. **CRITICAL - lỗi cách ly dữ liệu bệnh nhân ở UC8:** `JsonHealthRepository.saveCardiacEvaluation()` coi `reading.id` là duy nhất toàn hệ thống. Audit động chứng minh người dùng chỉ được phép truy cập `PATIENT_B` vẫn nhận HTTP 200 kèm reading của `PATIENT_A` nếu dùng trùng ID.
2. **CRITICAL - không có luồng AI/IoT thật:** AI endpoint trả 501, không có model/weights/dataset/metrics; firmware không có MAX30102, GPS, sensor task, payload backend, device/patient mapping hoặc inference.
3. **CRITICAL - luồng cảnh báo khẩn cấp bị đứt:** UC5, UC6, UC10, UC11 và UC12 chỉ là placeholder; không có buzzer/LED, xác nhận/hủy, timeout auto-confirm hay notification retry.
4. **HIGH - production authentication và bảo vệ phiên chưa có:** `/api/auth/login` trả 501; token development lưu dạng rõ; token không hết hạn; logout không xóa token; route frontend không có guard.
5. **HIGH - nguồn chấm/nộp thiếu:** không có Plan V2, Slides V2, rubric riêng, README cấp project, AI Audit/AI Log hay deployment guide nên không thể xác minh tiến độ, slide và phân công nhóm.

### Điểm dự kiến theo rubric

**36/100**, chỉ là ước lượng dựa trên bằng chứng hiện có, không phải điểm chính thức của giảng viên.

| Phần | Trọng số tối đa | Điểm dự kiến |
|---|---:|---:|
| Specs | 30 | 22 |
| PPT | 15 | 0 |
| Kế hoạch | 15 | 0 |
| Demo | 25 | 8 |
| Đánh giá chung của nhóm | 15 | 6 |
| **Tổng** | **100** | **36** |

## 2. Audit Scope and Sources

### Nguồn đã đọc

| Nguồn | Bằng chứng/phạm vi |
|---|---|
| `Specs_Final.pdf`, phiên bản 2.1, 33 trang PDF | Đã đọc toàn bộ text và render kiểm tra trực quan các trang đại diện; có 12 UC, 21 FR, 15 NFR, lịch sử phiên bản và danh sách phần cứng |
| `docs/ARCHITECTURE.md` | Kiến trúc frontend/backend, API contract, implemented/placeholder boundary |
| `docs/IMPLEMENTATION_STATUS.md` | Trạng thái UC do repository tự khai báo |
| `docs/TUNG_SPRINT_2_3_VERIFICATION.md` | Bằng chứng phạm vi một thành viên, lệnh test cũ và kịch bản demo development; không thay thế báo cáo toàn nhóm |
| `frontend/Healthcare Dashboard UI Prototype/README.md` | Chỉ hướng dẫn chạy frontend từ prototype Figma |
| `iot-firmware/docs/PLACEHOLDER_MODULES.md` | Xác nhận UC2/UC5/UC10/UC11 chưa có logic phần cứng |
| Toàn bộ file source/config/test tracked | 177 file tracked; đã kiểm kê cả file untracked và ignored |

### MISSING SOURCE DOCUMENT

Không tìm thấy trong repository:

- `Plan_V2 - Biểu đồ Gantt.pdf` hoặc bản tương đương.
- `Slides_V2.pptx` hoặc bản tương đương.
- Bảng tiêu chí chấm điểm riêng của giảng viên. Trọng số trong Section 15 chỉ lấy từ yêu cầu audit được cung cấp.
- File mô tả chủ đề riêng ngoài nội dung giới thiệu trong Specs.
- README cấp root mô tả cách chạy toàn hệ thống.
- AI Audit/AI Log, model card hoặc evaluation report.
- Hướng dẫn deployment production.
- Hướng dẫn demo/test toàn nhóm độc lập; chỉ có verification theo phạm vi Tùng.
- Wiring diagram, pin map hoàn chỉnh, video/hình ảnh phần cứng hoặc biên bản test thiết bị.

### Repository state được audit

| Thuộc tính | Kết quả ban đầu |
|---|---|
| Branch | `TungTungTung` |
| Commit | `3bdc468f9044e3b041a21e630af31fc7e6a77ec7` |
| `git status --short` | Không có đầu ra |
| `git diff --stat` | Không có đầu ra |
| `git diff --name-only` | Không có đầu ra |
| `git ls-files` | 177 file |
| File untracked (`git ls-files --others --exclude-standard`) | Không có |
| Ignored được phát hiện | `.vite/`, `dist/`, `node_modules/` trong frontend |

## 3. Repository and Tech Stack

### Cấu trúc chính

```text
ai-service/       Node.js fall-inference scaffold
backend/          Node.js native HTTP API, tests
database/         JSON development repository
docs/             Architecture/status/verification
frontend/         Vite + React dashboard
iot-firmware/     ESP-IDF components
Specs_Final.pdf   Specs v2.1
```

### Tech stack thực tế

| Thành phần | Stack/bằng chứng | Mức sẵn sàng |
|---|---|---|
| Frontend | React 18.3.1, TypeScript 5.9.3, Vite 6.3.5, React Router 7.13, Tailwind 4, MUI/Radix, Recharts | Development-ready cho UC3/UC4/UC7; chưa có production auth/E2E |
| Backend | Node.js ESM, native `node:http`, router tự viết, không framework | Chạy được cho subset; chưa production-ready |
| AI service | Node.js native HTTP route `/api/fall-inference` | Scaffold 501; không có AI model |
| Firmware | ESP-IDF target `esp32s3`; driver MPU6050; Wi-Fi SoftAP provisioning | Chỉ scaffold/driver; build bị chặn và chưa có pipeline sản phẩm |
| Persistence | `database/seed-data.json`, atomic rename và in-process write queue | Development-only; không có production DB/schema/migration |
| Authentication | Bearer token development từ JSON; frontend dev adapter | Không phải production authentication |
| Deployment | Chỉ có firmware devcontainer; không có Docker/deploy config cho app | MISSING |
| Testing | `node:test`, Vitest, React Testing Library, jsdom | Có unit/API/component test; không có browser E2E hoặc hardware test |
| Logging/observability | JSON error log cho cardiac handler; `ESP_LOG*` ở firmware | PARTIAL; không có metrics/tracing/monitoring, firmware log lộ Wi-Fi password |

Các manifest/lock/build chính: `backend/package.json`, `backend/package-lock.json`, `ai-service/package.json`, frontend `package.json`/`package-lock.json`/`tsconfig.json`/Vite/Vitest/ESLint config, firmware `CMakeLists.txt`, `idf_component.yml`, `dependencies.lock`.

## 4. Requirements Traceability Matrix

### 4.1 Actors, rules, contracts and acceptance basis

**Actors trong Specs:** Người dùng, Bệnh nhân, Người giám hộ, Hệ thống quản lý; nền tảng nhắn tin thứ ba xuất hiện như dependency của UC12.

**Business rules/acceptance chính:**

- FR1 yêu cầu so khớp mật khẩu đã mã hóa/hash.
- FR2-FR3 yêu cầu thu thập liên tục, kiểm tra và loại bỏ dữ liệu lỗi trước lưu/phân tích.
- UC7 yêu cầu min nhỏ hơn max, lưu ngưỡng và khôi phục default.
- UC8 so HR/SpO2 với ngưỡng cá nhân; UC9 phải suy luận AI từ chuyển động.
- SOS dùng nhấn giữ ít nhất 2 giây; hủy cảnh báo dùng nhấn giữ không quá 2 giây theo Specs, là quy tắc dễ gây nhầm và chưa có test phần cứng.
- Không phản hồi phải auto-confirm; notification thử lại tối đa 3 lần.
- Mục tiêu đầu tài liệu: cardiac chính xác >=90% và fall >=80%, mỗi luồng <=5 giây; NFR1 đặt mục tiêu chặt hơn là <=2 giây tới xác nhận bất thường.
- Specs không có ID acceptance criteria độc lập; audit dùng điều kiện thành công/thất bại và luồng UC làm acceptance basis.

**Hardware trong Specs:** ESP32-S3 N16R8, MAX30102, MPU6050, NEO-6M GPS, OLED, buzzer, LED, nút, pin/phụ kiện.

### 4.2 Use Case matrix

| ID | Yêu cầu | Người phụ trách | File triển khai | API/Hardware liên quan | Test/bằng chứng | Trạng thái | Phần còn thiếu |
|---|---|---|---|---|---|---|---|
| UC1 | Đăng nhập | UNASSIGNED | `backend/src/modules/auth`, `LoginScreen.tsx`, `authAdapter.ts` | `POST /api/auth/login` | Browser: production login trả 501 | MISSING | Hash password, xác thực thật, session expiry, logout/route guard |
| UC2 | Thu thập dữ liệu cảm biến | UNASSIGNED | `sensor-data`, driver MPU6050, Wi-Fi provisioning | `POST /api/sensor-data`; ESP32-S3/MPU6050/MAX30102 | Backend nhận HTTP reading; không có sensor task | PARTIAL | Continuous sampling, MAX30102, motion integration, transport, timestamp/device mapping |
| UC3 | Xem tổng quan | UNASSIGNED | `overview`, `HomeScreen.tsx` | `GET /api/overview` | API tests + UI tests + browser smoke | PASS | Chỉ còn production auth/DB và E2E toàn hệ thống |
| UC4 | Xem lịch sử/chi tiết cảnh báo | UNASSIGNED | `alert-history`, `AlertHistoryScreen.tsx` | `GET /api/alerts`, `GET /api/alerts/:id` | API/UI tests + browser list/detail | PASS | Pagination/production DB không được Specs yêu cầu rõ |
| UC5 | SOS | UNASSIGNED | Route/UI/type placeholder | `POST /api/sos`; nút SOS | Route 501, UI “Đang phát triển” | MISSING | Long-press, event, persistence, downstream notification |
| UC6 | Vị trí bệnh nhân | UNASSIGNED | Route/UI/type placeholder | `GET /api/patient-location`; NEO-6M/map | Route 501, UI “Đang phát triển” | MISSING | GPS ingest/store/auth/map/latest timestamp |
| UC7 | Hiệu chỉnh ngưỡng | UNASSIGNED | `personal-thresholds`, `SettingsScreen.tsx` | GET/PUT/restore-defaults | API + UI tests; browser GET | PASS | Production auth/DB; browser write không chạy để bảo toàn data |
| UC8 | Phát hiện bất thường tim mạch | UNASSIGNED | `cardiac-detection`, sensor adapter | `POST /api/sensor-data`, `/api/cardiac-detection/evaluate` | Evaluator/pipeline/concurrency/NFR test | PARTIAL | UC success yêu cầu local alert nhưng UC10 chưa có; code chạy backend trái mô tả edge; lỗi cross-patient duplicate |
| UC9 | Phát hiện té ngã | UNASSIGNED | Backend + AI placeholder types/routes | Backend evaluate; AI `/api/fall-inference`; MPU6050 | AI smoke trả 501 | MISSING | Model, weights, preprocessing, inference, integration, metrics |
| UC10 | Cảnh báo cục bộ | UNASSIGNED | Event publisher + route placeholder | `POST /api/local-alerts`; buzzer/LED/OLED | Chỉ event publisher test qua UC8 | MISSING | Device consumer, offline local operation, latency test |
| UC11 | Xác nhận/hủy | UNASSIGNED | Route/type placeholder | `POST /api/alert-responses`; nút | Route 501 | MISSING | Click/hold/debounce, timeout auto-confirm, persist state |
| UC12 | Nhắn tin cảnh báo | UNASSIGNED | Route/type placeholder | `POST /api/notifications`; third-party provider | Route 501 | MISSING | Provider, recipient mapping, retry 3 lần, delivery/audit state |

`UNASSIGNED` được dùng vì Plan V2 không có trong repository; không suy đoán phân công từ tên tác giả hoặc tài liệu cá nhân.

### 4.3 Functional Requirement matrix

| ID | Yêu cầu | Người phụ trách | File triển khai | API/Hardware liên quan | Test/bằng chứng | Trạng thái | Phần còn thiếu |
|---|---|---|---|---|---|---|---|
| FR1 | Xác thực với mật khẩu mã hóa | UNASSIGNED | Auth placeholder/dev adapter | `/api/auth/login` | Browser 501 | MISSING | User credential store, secure hash, session |
| FR2 | Thu thập liên tục từ cảm biến | UNASSIGNED | MPU6050 driver + HTTP ingress | MPU6050/MAX30102 | Không có app sensor loop | PARTIAL | MAX30102, sampling cadence, send queue |
| FR3 | Kiểm tra và loại dữ liệu lỗi | UNASSIGNED | `cardiac-detection.validation.js` | HR/SpO2 HTTP JSON | Unit/API validation tests | PARTIAL | Validation tại device, motion schema và real transport |
| FR4 | Hiển thị sức khỏe/ngưỡng | UNASSIGNED | Overview backend/UI | `GET /api/overview` | API/UI/browser | PASS | - |
| FR5 | Lưu/hiển thị lịch sử cảnh báo | UNASSIGNED | Alert history + JSON repo/UI | Alerts APIs | API/UI/browser | PASS | - |
| FR6 | Gửi SOS bằng nhấn giữ | UNASSIGNED | Placeholder | Nút/`POST /api/sos` | 501 | MISSING | Toàn bộ logic |
| FR7 | Nhấn giữ >=2 giây để SOS | UNASSIGNED | Placeholder | Nút | Không có test | MISSING | Timer/debounce/test thiết bị |
| FR8 | Hiển thị vị trí gần nhất | UNASSIGNED | Placeholder | GPS/map API | 501/UI placeholder | MISSING | Toàn bộ logic |
| FR9 | Thiết lập HR/SpO2 min/max | UNASSIGNED | Threshold backend/UI | GET/PUT | API/UI tests | PASS | - |
| FR10 | Validate ngưỡng trước lưu | UNASSIGNED | Threshold service/form | PUT | Boundary/error tests | PASS | - |
| FR11 | Khôi phục default | UNASSIGNED | Threshold service/UI | restore-defaults | API/UI tests | PASS | - |
| FR12 | So sánh HR/SpO2 với ngưỡng | UNASSIGNED | Cardiac evaluator/service | Sensor/evaluate API | Unit/pipeline tests | PASS | FR riêng đã chạy; UC8 tổng thể vẫn PARTIAL |
| FR13 | Phân tích chuyển động real-time | UNASSIGNED | Placeholder | MPU6050/AI | 501 | MISSING | Model/inference/pipeline |
| FR14 | Phân biệt normal/fall | UNASSIGNED | Placeholder | AI model | Không metrics | MISSING | Dataset, labels, accuracy/confusion matrix |
| FR15 | Kích hoạt cảnh báo local | UNASSIGNED | Publisher + placeholder | Buzzer/LED/OLED | Không có consumer | MISSING | Hardware command/driver/test |
| FR16 | Xác nhận/hủy trong thời gian chờ | UNASSIGNED | Placeholder | Nút/response API | 501 | MISSING | State machine/timer |
| FR17 | Không phản hồi thì auto-confirm | UNASSIGNED | Placeholder | Timer | Không có | MISSING | Toàn bộ logic |
| FR18 | Nhấn một lần để xác nhận | UNASSIGNED | Placeholder | Nút | Không có | MISSING | Debounce/event |
| FR19 | Nhấn giữ <=2 giây để hủy | UNASSIGNED | Placeholder | Nút | Không có | MISSING | Làm rõ rule và triển khai/test |
| FR20 | Gửi tin nhắn sau xác nhận | UNASSIGNED | Placeholder | Provider API | 501 | MISSING | Provider/recipient/template/audit |
| FR21 | Retry tối đa 3 lần | UNASSIGNED | Placeholder | Provider API | Không có | MISSING | Retry/backoff/failure state |

### 4.4 API/contract coverage

| API | Backend | Frontend dùng | Kết quả |
|---|---|---|---|
| `GET /api/health` | 200 | Không | Extra operational route, không có trong Specs |
| `POST /api/auth/login` | 501 | Có ở production adapter | Contract tồn tại nhưng chức năng MISSING |
| `GET /api/overview` | Có | Có | Khớp |
| `GET /api/alerts`, `GET /api/alerts/:id` | Có | Có | Khớp |
| Threshold GET/PUT/restore | Có | Có | Khớp |
| `POST /api/sensor-data` | Có | Không | API-only integration adapter |
| `POST /api/cardiac-detection/evaluate` | Có | Không | Backend-only |
| SOS/GPS/fall/local-alert/response/notification | Route 501 | Chỉ GPS/SOS có UI placeholder | Không demo chức năng |
| AI `POST /api/fall-inference` | 501 | Backend không gọi | Chưa tích hợp |

Fall schema không thống nhất: backend type dùng `acceleration`, AI type dùng `accelerometer`. Firmware chưa tạo payload nào nên chưa có contract firmware-backend để đối chiếu.

## 5. Frontend Audit

| Hạng mục | Bằng chứng | Trạng thái | Ghi chú |
|---|---|---|---|
| Login UI | Form/loading/error có; production call trả 501 | PARTIAL | Dev adapter chấp nhận mọi username/password không rỗng |
| Overview, HR, SpO2, device status, thresholds | API/UI/browser pass | PASS | Device status vẫn đến từ JSON demo |
| Alert History/Detail | API/UI/browser pass | PASS | Seed có FALL/SOS dù chức năng tạo tương ứng chưa có |
| Settings/update/restore | API/UI tests pass | PASS | Browser chỉ đọc để tránh đổi JSON |
| GPS/SOS | UI ghi rõ “Đang phát triển” | MISSING | Không fake chức năng |
| Loading/empty/error/retry | Overview có test; Alerts/Settings có code | PARTIAL | Chưa có test mọi nhánh ở Alerts/Settings |
| Validation | Local + server field errors, min < max | PASS | Có test |
| Responsive | Browser 1365x768 và 390x844; mobile `scrollWidth=clientWidth=390` | PASS | Có mobile bottom navigation |
| Accessibility cơ bản | Focus styles, nút >=48 px, nhiều ARIA | PARTIAL | Login label không liên kết input: browser `getByLabel` trả 0 cho email/password |
| API error handling | `ApiError`, retry states | PASS | Chỉ áp dụng các màn hình đã tích hợp |
| Auth state/route protection | Token module-level; không guard | MISSING | Logout chỉ navigate; direct `/overview` vẫn mở sau logout |
| Console error | 0 warning/error trên login/overview/alerts/settings/GPS/SOS đã smoke | PASS | Không thay thế E2E suite |
| Dữ liệu mock/hard-code | Dev token hard-code; seed demo | PARTIAL | Không nên dùng seed để chứng minh fall/SOS |

Frontend có `test`, `lint`, `typecheck`, `build`; không có Playwright/Cypress. Production bundle JS minified là 687,52 kB, vượt ngưỡng cảnh báo 500 kB.

## 6. Backend Audit

| Hạng mục | Bằng chứng | Trạng thái | Ghi chú |
|---|---|---|---|
| Server startup/health | Local smoke `/api/health` trả 200 | PASS | Native HTTP |
| Route registration | Tất cả module được ghép trong `modules/index.js` | PASS | Placeholder vẫn được register và trả 501 |
| Validation | JSON size/type, thresholds, cardiac reading | PARTIAL | Chưa có validation cho các UC chưa triển khai |
| Error handling | Structured JSON responses | PARTIAL | Global catch luôn trả `DATABASE_ERROR`; logging không phủ toàn bộ handler |
| Authentication | Dev Bearer lookup | MISSING | Không đáp ứng FR1/production |
| Authorization/patient scope | 401/403 tests, caregiver check | PARTIAL | Bị phá vỡ bởi lỗi duplicate ID cross-patient |
| Overview | API tests pass | PASS | - |
| Alert APIs | List/detail/sort/nullable/404/403 tests pass | PASS | - |
| Threshold APIs | Get/update/validate/default tests pass | PASS | - |
| Sensor data | Reuse cardiac controller | PARTIAL | Không phải device transport/continuous collection |
| Cardiac detection | Rule-based threshold evaluator | PASS | Không phải AI; chạy backend, không phải edge như Specs |
| Fall/SOS/GPS | Route 501 | MISSING | - |
| Deduplication/concurrency | Same-ID concurrent test tạo một alert/event | PARTIAL | ID không scope theo patient, gây data leak |
| Persistence | Atomic temp-file rename + serialized write queue | PARTIAL | JSON development-only; queue chỉ trong một process |
| Structured logging | Cardiac error chỉ log event/error type | PARTIAL | Firmware lại log credential |
| Boundary/missing/invalid data | Có test cho thresholds/cardiac | PASS | Chỉ subset |
| Production adapter | Không có | MISSING | Không DB/auth/device/message adapter |

### Lỗi cross-patient đã tái hiện

Với database tạm ngoài repository:

1. Tạo reading `SHARED_ID` thuộc `PATIENT_A`.
2. Token chỉ được truy cập `PATIENT_B`.
3. Gửi `POST /api/sensor-data` cho `PATIENT_B` với cùng `id=SHARED_ID`.
4. Backend trả HTTP 200 và:

```json
{"id":"SHARED_ID","patientId":"PATIENT_A","heartRate":66,"spo2":99,"measuredAt":"2026-07-25T00:00:00.000Z"}
```

Nguyên nhân nằm ở lookup `existingReading` chỉ theo `measurement.id`; cần khóa/lookup theo patient + reading ID hoặc enforce ID toàn cục mà không bao giờ trả dữ liệu khác patient, kèm regression test.

## 7. AI Service Audit

| Hạng mục | Bằng chứng | Trạng thái |
|---|---|---|
| Server/route | Server start được; `/api/fall-inference` trả 501 | PARTIAL |
| AI model thật | Không có model file/weights/runtime inference | MISSING |
| Input/output contract | Chỉ JSDoc placeholder; lệch `acceleration`/`accelerometer` với backend | PARTIAL |
| Preprocessing | Không có | MISSING |
| Inference/confidence threshold | Không có | MISSING |
| Backend integration | Backend fall route không gọi AI service | MISSING |
| Dataset/data provenance | Không có | MISSING |
| Accuracy/precision/recall/F1 | Không có; không chứng minh mục tiêu >=80% | MISSING |
| Test | Không có script/test | MISSING |
| Lint/build | Pass nhưng chỉ syntax/import scaffold; không chứng minh chức năng | PASS |
| Missing-model behavior | Luôn trả 501 rõ ràng | PARTIAL |

Phân loại chính xác: **chưa có AI model, chưa có rule-based fall detector, không trả mock prediction, chưa tích hợp**.

## 8. IoT Firmware and Hardware Audit

| Hạng mục | Bằng chứng | Trạng thái |
|---|---|---|
| ESP32-S3 target | `dependencies.lock` target `esp32s3` | PARTIAL |
| MPU6050 | Driver đọc accel/gyro tồn tại | PARTIAL |
| MAX30102 HR/SpO2 | Không có source/dependency | MISSING |
| GPS NEO-6M | Không có source/pin/parse | MISSING |
| Buzzer/LED/OLED | Không có driver/command | MISSING |
| SOS/confirm button | Chỉ GPIO15 reset provisioning; không có SOS flow | MISSING |
| Network | SoftAP provisioning + reconnect call | PARTIAL |
| Sensor sampling | Không có task/app integration | MISSING |
| Payload backend | Không HTTP/MQTT payload | MISSING |
| Retry/reconnect | Wi-Fi reconnect không backoff; không có data retry | PARTIAL |
| Timestamp/device ID/patient mapping | Không có | MISSING |
| Local alert/offline behavior | Không có | MISSING |
| Wiring/pin configuration | Chỉ MPU address và GPIO15 reset | PARTIAL |
| Firmware entry | `main/main.c` 0 byte; `app_main` nằm trong network helper | PARTIAL |
| Build/test/hardware evidence | `idf.py` thiếu; không video/hình/test | BLOCKED |

Các vấn đề bổ sung:

- `idf_component.yml` khai báo `espressif/esp-tflite-micro`, nhưng `dependencies.lock` không chứa dependency này.
- Provisioning log in cả SSID và **password**; Proof-of-Possession hard-code `"abcd1234"`.
- Không được đánh dấu PASS phần cứng chỉ vì backend có endpoint.

## 9. Database and Persistence Audit

| Hạng mục | Bằng chứng | Trạng thái |
|---|---|---|
| JSON repository | `JsonHealthRepository` đọc/ghi `seed-data.json`; phạm vi chỉ là development | PASS |
| Production DB/ORM | Không có | MISSING |
| Schema/migration | Không có schema validator/migration | MISSING |
| Seed | Có users/patients/measurements/thresholds/alerts | PARTIAL |
| Patient/user-caregiver | Có JSON shape | PARTIAL |
| Sensor reading/threshold/alert | Có và được API dùng | PARTIAL |
| GPS/SOS/notification/response entities | Không có | MISSING |
| Quan hệ/constraint | Chỉ logic bằng array lookup | MISSING |
| Duplicate prevention | Có same-reading idempotency nhưng lỗi cross-patient | PARTIAL |
| Timestamp | Có `measuredAt`, `occurredAt`, `confirmedAt` ở subset | PARTIAL |
| Retention/backup/restore | Không có | MISSING |
| Encryption at rest | Không có; JSON rõ | MISSING |

Database hiện là **development-only**, không production-ready. Seed có các alert `FALL_DETECTED` và `SOS` dù UC5/UC9 chưa triển khai; đây là dữ liệu demo/mock, không phải bằng chứng chức năng.

Backend tests không thay đổi seed: API tests dùng repository giả; cardiac tests tạo/xóa database trong thư mục tạm. Browser audit chỉ thực hiện GET. `database/seed-data.json` không đổi trong audit.

## 10. Authentication and Security Audit

| Hạng mục | Bằng chứng | Trạng thái |
|---|---|---|
| Login thật | Endpoint 501, dev adapter chấp nhận input không rỗng | MISSING |
| Password hash | Không có password store/hash | MISSING |
| Token validation | Lookup plaintext token trong JSON | PARTIAL |
| Token expiry/revocation | Không có | MISSING |
| Patient authorization | 401/403 + caregiver scope tests | PARTIAL |
| Role model | Chỉ caregiver check cho thresholds | PARTIAL |
| 401/403 | Có test trên route đã triển khai | PASS |
| Input validation | Có cho JSON/threshold/cardiac | PARTIAL |
| Secret/env handling | Dev token trong seed/env example; firmware PoP hard-code | MISSING |
| Sensitive logging | Cardiac log an toàn; firmware log Wi-Fi password | MISSING |
| CORS | `Access-Control-Allow-Origin: *` | PARTIAL |
| Transport/storage encryption | HTTP + plaintext JSON | MISSING |
| Rate limit | Không có; Specs không nêu trực tiếp nhưng nên có cho auth/ingest | MISSING |
| Frontend session/logout | Token chỉ nằm trong module; logout không xóa | MISSING |
| Route protection | Không có guard | MISSING |

## 11. Non-functional Requirements Audit

| NFR | Mục tiêu | Cách đo | Kết quả thực tế | Bằng chứng | Trạng thái |
|---|---|---|---|---|---|
| NFR1 | <=2 giây nhận data đến xác nhận | API processing + round-trip | Temp API trả `processingTimeMs=4.61`, test loopback <=2s | Backend test + audit động; development only | PARTIAL |
| NFR2 | <=1 giây xác nhận đến local alert | Device end-to-end | Không có consumer | UC10 placeholder | MISSING |
| NFR3 | <=1 giây xác nhận đến tin nhắn | Provider end-to-end | Không có | UC12 placeholder | MISSING |
| NFR4 | Luồng liên tục nhiều thiết bị | Load/concurrency test | Chỉ test 2 request trùng trong một process | JSON queue | MISSING |
| NFR5 | Offline buffer + resync | Mất mạng/khôi phục | Không có | Firmware source | MISSING |
| NFR6 | Local alert không internet | Hardware test | Không có | Firmware placeholder | MISSING |
| NFR7 | Retry notification 3 lần | Provider failure test | Không có | UC12 placeholder | MISSING |
| NFR8 | Mơ hồ thì coi alert thật | Timeout/state-machine test | Không có | UC11 placeholder | MISSING |
| NFR9 | Khả dụng cao | Uptime/recovery/SLO | Không có deployment/measurement | Không source | MISSING |
| NFR10 | Mã hóa health/location at rest/transit | Config/code review | HTTP + plaintext JSON | Server/repository | MISSING |
| NFR11 | Password hash an toàn | Auth implementation test | Không có password | Auth placeholder | MISSING |
| NFR12 | Chỉ caregiver được ủy quyền xem data | 401/403/cross-patient tests | Scope pass ở API thường nhưng duplicate leak; GPS thiếu | API tests + audit động | PARTIAL |
| NFR13 | UI đơn giản | Responsive/browser/usability | UI chạy desktop/mobile, chưa usability study | Browser smoke | PARTIAL |
| NFR14 | Nút dễ thao tác | Size/accessibility/hardware | UI nút >=48px; nút thiết bị chưa có; login label lỗi | CSS/browser/code | PARTIAL |
| NFR15 | Mở rộng thiết bị mới | Architecture/build proof | Module hóa một phần; chưa có adapter/device test | Folder structure | PARTIAL |

Không dùng test NFR1 development để kết luận hiệu năng production/edge. Không có bằng chứng accuracy >=90% cho cardiac hoặc >=80% cho fall.

## 12. Automated Test, Lint and Build Results

| Thành phần | Lệnh | Exit code | Pass | Fail | Warning/Blocker |
|---|---|---:|---:|---:|---|
| Backend | `npm run test` | 0 | 39 | 0 | 6 suites, 0 skip; 1.051 s wall, runner 344 ms |
| Backend | `npm run lint` | 0 | 1 command | 0 | Chỉ `node --check src/server.js`, không phải linter toàn source |
| Backend | `npm run build` | 0 | 1 import | 0 | Chỉ import server |
| Backend | `npm run typecheck` | N/A | 0 | 0 | MISSING script |
| Frontend | `npm run test` | 0 | 13 | 0 | 4 files, 0 skip; Vitest 5.62 s |
| Frontend | `npm run lint` | 0 | 1 command | 0 | `eslint src test --max-warnings=0` |
| Frontend | `npm run typecheck` | 0 | 1 command | 0 | `tsc --noEmit` |
| Frontend | `npm run build -- --outDir <temp> --emptyOutDir` | 0 | 2308 modules | 0 | JS 687.52 kB > 500 kB warning; output ngoài repo |
| Frontend dependency tree | `npm ls --depth=0` | 0 | 1 tree | 0 | Không thấy missing/version conflict |
| Frontend lock dry-run | `npm install --package-lock-only --ignore-scripts --dry-run` | 0 | 1 | 0 | Không cài package, không đổi lock |
| Backend + AI JS syntax | `node --check` cho toàn bộ 51 file JS | 0 | 51 | 0 | - |
| AI | `npm run lint` | 0 | 1 command | 0 | Chỉ check `server.js` |
| AI | `npm run build` | 0 | 1 import | 0 | Scaffold import được |
| AI | `npm test` / typecheck | N/A | 0 | 0 | MISSING scripts |
| Firmware | `idf.py build` | 127 | 0 | 0 | BLOCKED: `idf.py` không được nhận diện; Docker cũng không có |
| E2E | Playwright/Cypress | N/A | 0 | 0 | MISSING script/dependency |
| Browser smoke | Local production build + backend | 0 | Các route đã nêu | 0 console error | Login 501; GPS/SOS placeholder; không ghi data |

Không có command test/build hiện hữu nào fail ngoài firmware command bị chặn bởi executable thiếu. Build frontend được chuyển output sang thư mục temp để bảo toàn `dist/` hiện có.

## 13. Specs-Plan-Slides-Code Inconsistencies

### Đã xác minh

1. **Specs UC8:** điều kiện tiên quyết ghi ngưỡng đã thiết lập `(UC8)`; đúng quan hệ chức năng phải trỏ tới use case hiệu chỉnh ngưỡng, nhưng audit chỉ ghi nhận chắc chắn tham chiếu hiện tại tự trỏ sai.
2. **Specs UC8:** điều kiện thành công ghi local alert `(UC11)` trong khi UC11 là xác nhận/hủy; đây là tham chiếu sai.
3. **Specs UC9:** điều kiện thành công cũng ghi local alert `(UC11)`; cùng lỗi tham chiếu.
4. **Specs UC10:** trạng thái chờ xác nhận/hủy ghi `(UC12)` trong khi UC12 là notification; đây là tham chiếu sai.
5. **Specs UC5:** điều kiện thành công ghi gửi tin nhắn `(UC13)` nhưng tài liệu chỉ có UC1-UC12.
6. **Specs UC12:** precondition nói tài khoản nền tảng thứ ba được liên kết ở UC7, nhưng UC7 chỉ đặc tả ngưỡng cá nhân.
7. Specs có bảng lịch sử phiên bản ở trang PDF 2.
8. Specs mô tả xử lý/suy luận trực tiếp trên edge; code thực tế thực hiện FR12 tại backend, firmware không có inference.
9. Specs hướng tới ứng dụng di động cài qua nền tảng thứ ba; code là responsive web app Vite.
10. `IMPLEMENTATION_STATUS.md` gọi UC8 “IMPLEMENTED”, nhưng điều kiện thành công của UC8 cần local alert và UC10 vẫn placeholder; ở cấp UC phải là PARTIAL.
11. Seed chứa alert FALL/SOS trong khi code tạo các feature đó chưa có; demo có thể làm người xem hiểu nhầm đó là output thật.
12. AI/backend fall contract lệch tên trường `accelerometer` và `acceleration`.
13. Firmware manifest khai báo TensorFlow Lite Micro nhưng lock không có dependency và source không dùng.
14. Code thêm các hành vi chưa mô tả rõ trong Specs: `/api/health`, stale-data status, deterministic alert ID/idempotency.

### Không thể xác minh do thiếu nguồn

- Tiêu đề slide fall detection có bị ghi thành cardiac detection hay không: **BLOCKED - Slides V2 missing**.
- Slide nói ESP32 hay backend phát hiện bất thường: **BLOCKED - Slides V2 missing**.
- Danh sách API/kiến trúc/nội dung/chính tả/hình trên slide: **BLOCKED - Slides V2 missing**.
- Plan còn task 0% dù code đã có hoặc task completed nhưng thiếu code: **BLOCKED - Plan V2 missing**.
- Phân công giữa Plan và tài liệu khác: **BLOCKED - Plan V2 missing**.

Không đưa các nghi ngờ về slide/plan vào kết luận như một lỗi đã xảy ra.

## 14. Demo Readiness Checklist

| Bước demo | Cách chạy | Dữ liệu cần dùng | Kết quả mong đợi | Bằng chứng hiện có | Trạng thái |
|---|---|---|---|---|---|
| Cài dependency | npm install theo lock; ESP-IDF | Lockfiles | Cài sạch | Frontend node_modules hiện có; AI không lock; firmware env thiếu | PARTIAL |
| Biến môi trường | `.env.example`, `CAREWATCH_*` | Dev token/config | Cấu hình rõ | Chỉ frontend example + code comments | PARTIAL |
| Persistence | Backend tự đọc JSON | Seed/copy | Repository sẵn sàng | Đọc/ghi/test được | PASS |
| Backend | `cd backend; npm start` | JSON | Health/API 200 | Smoke pass | PASS |
| AI service | `cd ai-service; npm start` | Model | Inference | Server chạy nhưng route 501 | MISSING |
| Frontend | `npm run dev` hoặc build | API URL/token | UI mở | Build/browser pass | PASS |
| Firmware/device | `idf.py build/flash` | ESP32 + sensors | Device online | Build blocked, feature thiếu | MISSING |
| Đăng nhập | UI login | User thật | Session hợp lệ | Dev-only; production 501 | MISSING |
| Overview | Mở `/overview` | Seed/API | HR/SpO2/status | Browser pass bằng hệ thống dev | PASS |
| HR/SpO2 | Overview | Seed hoặc device | Chỉ số mới | Chỉ seed/API; không device | PARTIAL |
| Thay ngưỡng | Settings | Caregiver dev token | Persist/reload | API/UI tests; development JSON | PASS |
| Tạo reading bất thường | POST sensor API | JSON reading | Evaluation abnormal | API-only | PARTIAL |
| Tạo alert | Cùng request | Ngưỡng | Alert mới | API-only, local alert chưa có | PARTIAL |
| Alert History/Detail | UI | JSON alerts | List/detail | Browser pass | PASS |
| Chống alert trùng | Gửi cùng ID | Reading ID | Một alert | Same-patient pass; cross-patient lỗi | PARTIAL |
| Local buzzer/LED | Device | Alert command | Cảnh báo tại chỗ | Không consumer | MISSING |
| GPS | `/gps` | GPS record | Map/latest time | UI placeholder | MISSING |
| SOS | Nút/API | Hold >=2s | SOS alert | UI/API placeholder | MISSING |
| Fall detection | Motion -> AI | MPU samples/model | Fall prediction/alert | Chỉ seed fall alert mock | MISSING |
| Mobile/responsive | 390x844 | Browser | Không overflow | Browser pass | PASS |
| Mất mạng/backend lỗi | Tắt service/network | Error scenario | Retry/offline/local safety | UI error/retry có; firmware offline buffer không có | PARTIAL |
| Confirm/cancel/notify | Nút -> provider | Active alert | State + message | Placeholder | MISSING |

**Phân loại demo:**

- Demo bằng hệ thống development thật: Overview, Alert History/Detail, đọc Settings.
- Demo bằng API: ingest/cardiac rule/alert/dedup trong giới hạn đã nêu.
- Demo bằng mock/seed: FALL, SOS và một số lịch sử alert.
- Chỉ có giao diện: GPS và SOS placeholder.
- Chưa thể demo: AI fall inference, sensor device pipeline, local hardware alert, confirm/cancel, notification.

## 15. Rubric-based Evaluation

Điểm dưới đây là ước lượng bằng chứng, không phải điểm chính thức.

| Tiêu chí | Trọng số | Bằng chứng hiện có | Phần còn thiếu | Mức rủi ro | Điểm dự kiến |
|---|---:|---|---|---|---:|
| Specs | 30 | v2.1, 12 UC, 21 FR, 15 NFR, version history, hardware list | Nhiều reference sai; edge/code lệch; không có validation cho accuracy | HIGH | 22/30 |
| PPT | 15 | Không có source | Toàn bộ slide và đối chiếu | HIGH | 0/15 |
| Kế hoạch | 15 | Không có source | Gantt, tiến độ, owner, dependency | HIGH | 0/15 |
| Demo | 25 | UC3/4/7 + rule FR12 development chạy | AI/IoT/auth/emergency chain/GPS/SOS | CRITICAL | 8/25 |
| Đánh giá chung nhóm | 15 | Module hóa, 52 test pass tổng cộng, docs status | Integration, security, E2E, hardware evidence, deployment | HIGH | 6/15 |

## 16. Missing Items by Priority

### P0 - Bắt buộc trước demo/nộp

| Priority | Việc còn thiếu | Lý do | Thành phần/task | Người phụ trách | Dependency | Cách xác nhận hoàn thành |
|---|---|---|---|---|---|---|
| P0 | Sửa cross-patient duplicate/data leak | Vi phạm isolation/NFR12 | Backend repository/UC8 | UNASSIGNED | Schema ID policy | Regression test: token B không bao giờ nhận data A; concurrent tests pass |
| P0 | Production login + password hash + expiry/logout/route guard | FR1 và demo login đang fail | Auth/frontend | UNASSIGNED | User store, auth design | Login đúng/sai, expiry, 401/403, logout/direct-route E2E |
| P0 | Real sensor pipeline MAX30102 + MPU6050 -> backend | Không có dữ liệu thiết bị thật | Firmware/UC2 | UNASSIGNED | Board/sensors/network | Build/flash, serial log, backend nhận payload đúng contract |
| P0 | AI fall model + evaluation + backend integration | Mục tiêu AI chính hoàn toàn thiếu | AI/UC9 | UNASSIGNED | Dataset/model/runtime | Versioned model, repeatable eval >= mục tiêu, API integration tests |
| P0 | Local buzzer/LED alert hoạt động offline | NFR2/NFR6 và demo safety | Firmware/UC10 | UNASSIGNED | Device command/state | Hardware video/test đo latency <=1s, không internet vẫn báo |
| P0 | Confirm/cancel/timeout auto-confirm | Chuỗi alert chưa thể kết thúc | Firmware/backend/UC11 | UNASSIGNED | Local alert + button | Click/hold/debounce/timeout tests và persisted status |
| P0 | Notification provider + retry 3 lần | Không cảnh báo người giám hộ | Backend/UC12 | UNASSIGNED | Confirm/SOS, provider credentials | Success/failure/retry/audit integration test |
| P0 | SOS end-to-end | Use case bắt buộc missing | Firmware/backend/UC5 | UNASSIGNED | Button + notification | Hold >=2s tạo SOS một lần và gửi downstream |
| P0 | GPS ingest/store/authorized map | FR8 missing | Firmware/backend/frontend/UC6 | UNASSIGNED | GPS module/map decision | Latest location từ device hiển thị đúng caregiver |
| P0 | Khôi phục môi trường ESP-IDF và build firmware | Hiện không thể compile | Firmware | UNASSIGNED | ESP-IDF hoặc devcontainer Docker | `idf.py build` exit 0, flash/smoke log |
| P0 | Bổ sung Plan V2, Slides V2 và rubric nguồn | Không thể audit/chấm/nộp đầy đủ | Documents | UNASSIGNED | Tài liệu nhóm | File vào repo và re-audit cross-document |

### P1 - Tích hợp giữa thành viên

| Priority | Việc còn thiếu | Lý do | Thành phần/task | Người phụ trách | Dependency | Cách xác nhận hoàn thành |
|---|---|---|---|---|---|---|
| P1 | Chốt một schema firmware-backend-AI | Hiện fall field lệch và firmware không payload | Integration | UNASSIGNED | P0 device/AI | Contract tests/shared fixtures pass |
| P1 | Chốt edge vs backend processing và cập nhật docs/code | Specs nói edge, code chạy backend | Architecture | UNASSIGNED | Model/runtime decision | Architecture decision record + demo đúng sơ đồ |
| P1 | Production DB/schema/migrations/constraints | JSON không đủ production/multi-process | Persistence | UNASSIGNED | Entity design | Migration from clean DB, unique/FK tests |
| P1 | Entity GPS/SOS/response/notification | Chuỗi data thiếu | Persistence | UNASSIGNED | UC5/6/11/12 design | Schema + repository + API tests |
| P1 | End-to-end browser/device test | Unit/component không chứng minh demo | QA | UNASSIGNED | P0 features | Một lệnh chạy luồng login->device->alert->notify |
| P1 | Secrets/TLS/CORS policy | Plaintext/logging/wildcard CORS | Security | UNASSIGNED | Deployment/auth | Secret scan, HTTPS, origin allowlist, no credential logs |
| P1 | Multi-device/load/concurrency test | NFR4 chưa đo | Backend/DB | UNASSIGNED | Production DB | Load report với device count/latency/error rate |
| P1 | Data offline buffer/resync | NFR5 missing | Firmware/backend | UNASSIGNED | Device storage/transport | Network-loss test không mất/duplicate data |

### P2 - Chất lượng và tài liệu

| Priority | Việc còn thiếu | Lý do | Thành phần/task | Người phụ trách | Dependency | Cách xác nhận hoàn thành |
|---|---|---|---|---|---|---|
| P2 | Sửa toàn bộ UC cross-reference trong Specs | Tránh mâu thuẫn khi chấm | Specs | UNASSIGNED | Review nhóm | Peer review từng UC link |
| P2 | Root README/runbook/demo/deployment guide | Nhóm khác không tái lập được | Docs | UNASSIGNED | Final architecture | Fresh-machine rehearsal |
| P2 | AI Audit/Log/model card | Thiếu provenance/metrics | AI docs | UNASSIGNED | P0 model | Dataset/version/metrics/reproduce command |
| P2 | Wiring/pin diagram + BOM as-built | Chỉ có BOM dự kiến | Firmware docs | UNASSIGNED | Hardware final | Diagram khớp code và ảnh thiết bị |
| P2 | Bổ sung test Alerts/Settings error/empty và auth | Coverage frontend còn lệch | Frontend | UNASSIGNED | APIs | Tests pass, không duplicate count |
| P2 | Backend lint thật và typecheck/JSDoc validation | Script lint chỉ check một file | Backend | UNASSIGNED | Tooling decision | Toàn source lint/typecheck pass |
| P2 | AI test/lint toàn source | Hiện chỉ import/check server | AI | UNASSIGNED | P0 model | Unit/integration suite pass |
| P2 | Loại hoặc gắn nhãn rõ seed FALL/SOS mock | Tránh demo gây hiểu nhầm | Database/demo | UNASSIGNED | Demo plan | UI/demo ghi rõ synthetic hoặc tạo từ feature thật |
| P2 | Accessibility audit | Login label không liên kết | Frontend | UNASSIGNED | UI stable | Axe/manual keyboard/label test pass |

### P3 - Tối ưu nếu còn thời gian

| Priority | Việc còn thiếu | Lý do | Thành phần/task | Người phụ trách | Dependency | Cách xác nhận hoàn thành |
|---|---|---|---|---|---|---|
| P3 | Code-split frontend | Bundle 687.52 kB | Frontend | UNASSIGNED | Feature freeze | Build không còn chunk warning hoặc có budget rõ |
| P3 | Metrics/tracing/dashboard vận hành | Observability hiện rất ít | Backend/AI | UNASSIGNED | Deployment | Trace end-to-end và alerting vận hành |
| P3 | Data retention/backup/restore | Chưa có policy | Database | UNASSIGNED | Production DB | Restore drill + retention test |
| P3 | Cải thiện văn bản tiếng Việt có dấu/consistency | UI hiện không dấu | Frontend/docs | UNASSIGNED | Content review | Copy review pass |

## 17. Recommended Completion Order

1. Đóng lỗi cross-patient và chốt security/auth baseline trước khi thêm integration.
2. Chốt kiến trúc edge/backend, schema chung và entity/state machine cảnh báo.
3. Khôi phục ESP-IDF build; tích hợp MAX30102 + MPU6050 + device ID/timestamp/transport.
4. Hoàn thiện production auth và production persistence/migrations.
5. Huấn luyện/chọn model fall, tạo model card/evaluation và tích hợp AI-backend/device.
6. Hoàn thiện local alert -> confirm/cancel/auto-confirm -> notification retry.
7. Hoàn thiện SOS và GPS end-to-end.
8. Viết E2E/load/offline/security/hardware tests; đo NFR trên môi trường demo gần production.
9. Rehearse demo từ clean environment, không dựa vào seed giả; ghi video/bằng chứng thiết bị.
10. Cập nhật Specs cross-reference, Plan, Slides, README, AI log và rubric traceability theo code cuối.

## 18. Final Verdict

**NOT READY**

Lý do quyết định: demo end-to-end theo Specs không thể hoàn thành do production login, device sensor pipeline, AI fall detection, local hardware alert, confirm/cancel, SOS/GPS và notification đều thiếu; firmware còn không build được trong môi trường audit. Subset web/API hiện tại có chất lượng test tốt hơn phần còn lại nhưng không đại diện cho toàn bộ đồ án AI & IoT.

## 19. Evidence Appendix

### Lệnh và kết quả cốt lõi

- `git status --short`, `git diff --stat`, `git diff --name-only`: sạch trước audit.
- `git ls-files`: 177 file; `git ls-files --others --exclude-standard`: 0.
- Backend test: 39 pass, 0 fail, 0 skip.
- Frontend test: 13 pass, 0 fail, 4 files.
- Frontend lint/typecheck/build: exit 0; build 2308 modules; warning JS 687.52 kB.
- AI lint/build: exit 0; AI inference smoke: HTTP 501 `FEATURE_NOT_IMPLEMENTED`.
- Toàn bộ 51 file JS backend/AI: `node --check` pass.
- Firmware: `idf.py build` exit 127 với lỗi: `The term 'idf.py' is not recognized as the name of a cmdlet, function, script file, or operable program.`
- Browser smoke: production login 501; Overview/Alerts/Settings GET được; GPS/SOS placeholder; mobile 390 px không overflow; console warning/error = 0.
- Audit NFR1 trên DB tạm: response 201, `processingTimeMs=4.61`, `nfr1Met=true`; chỉ là development loopback.
- Audit isolation trên DB tạm: token của patient B nhận reading patient A khi trùng ID, xác nhận blocker CRITICAL.

### File triển khai/bằng chứng trọng yếu

- Specs: `Specs_Final.pdf`, đặc biệt PDF pages 2, 4-33.
- Routes: `backend/src/modules/index.js` và từng module `index.js`.
- Auth: `backend/src/modules/auth/*`, frontend `authAdapter.ts`, `api.ts`, `App.tsx`.
- Persistence: `backend/src/data/json-health.repository.js`, `database/seed-data.json`.
- Cardiac: `backend/src/modules/cardiac-detection/*`.
- UI: `HomeScreen.tsx`, `AlertHistoryScreen.tsx`, `SettingsScreen.tsx`, `PlaceholderRoutes.tsx`.
- AI: `ai-service/src/modules/fall-inference/*`.
- Firmware: `iot-firmware/components/mpu6050/*`, `network_prov_helper/*`, `main/main.c`, manifests.
- Tests: `backend/test/*.test.js`, frontend `test/*.test.tsx`.

### Bảo toàn repository

Test ghi dữ liệu chỉ dùng repository giả hoặc database tạm. Build frontend xuất ra thư mục temp ngoài repository. Không cài package, không sửa seed/database/JSON, không sửa code/Specs/slide/plan, không commit và không push.
