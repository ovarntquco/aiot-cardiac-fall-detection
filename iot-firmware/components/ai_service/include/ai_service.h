#ifndef AI_SERVICE_H
#define AI_SERVICE_H

#include "../../mpu6050/include/mpu6050_payload.h"
#include "ei_classifier_types.h"
#include "esp_err.h"

#ifdef __cplusplus
extern "C" {
#endif

esp_err_t inference(const mpu6050_payload_t* payload, ei_impulse_result_t* result);
bool is_fall(ei_impulse_result_t* result);

#ifdef __cplusplus
}
#endif

#endif