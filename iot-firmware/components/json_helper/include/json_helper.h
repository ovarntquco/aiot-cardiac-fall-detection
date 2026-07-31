#ifndef JSON_HELPER_H
#define JSON_HELPER_H

#include "mpu6050_batch.h"

#ifdef __cplusplus
extern "C" {
#endif

char* json_convert_motion(const mpu6050_batch_t* batch);

#ifdef __cplusplus
}
#endif

#endif