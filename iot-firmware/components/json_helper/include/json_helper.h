#ifndef JSON_HELPER_H
#define JSON_HELPER_H

#include "event_payload.h"
#include "max30102_payload.h"
#include "mpu6050_payload.h"
#include "neo6mgps_payload.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    char* device_id;
    int hr_low;
    int hr_high;
    int spo2_low;
} vital_payload_t;

char* json_convert_cardiac(const max30102_payload_t* p);
char* json_convert_motion(const mpu6050_payload_t* p);
char* json_convert_gps(const neo6mgps_payload_t* p);
char* json_convert_event(const event_payload_t* p);
vital_payload_t json_parse_vitals(const char* const data, size_t data_len);

#ifdef __cplusplus
}
#endif

#endif