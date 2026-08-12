#ifndef AI_SERVICE_H
#define AI_SERVICE_H

#include "esp_err.h"

#include "mpu6050_payload.h"

#ifdef __cplusplus
extern "C" {
#endif

#define INFERENCE_TAG "INFERENCE"

esp_err_t inference(const mpu6050_payload_t* payload, uint8_t* const is_fall);

#ifdef __cplusplus
}
#endif

#endif