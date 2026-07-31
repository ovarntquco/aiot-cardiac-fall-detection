#ifndef JSON_HELPER_H
#define JSON_HELPER_H

#include "max30102_payload.h"
#include "mpu6050_payload.h"
#include "neo6mgps_payload.h"

#ifdef __cplusplus
extern "C" {
#endif

char* json_convert_cardiac(const max30102_payload_t* p);
char* json_convert_motion(const mpu6050_payload_t* p);
char* json_convert_gps(const neo6mgps_payload_t* p);

#ifdef __cplusplus
}
#endif

#endif