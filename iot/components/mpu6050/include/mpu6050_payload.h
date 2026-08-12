#ifndef MPU6050_PAYLOAD_H
#define MPU6050_PAYLOAD_H

#include "esp_err.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef enum {
    MPU6050_PAYLOAD_INFER = 0,
    MPU6050_PAYLOAD_MQTT = 1
} mpu6050_payload_type_t;

typedef struct {
    float acce_x;
    float acce_y;
    float acce_z;
    float gyro_x;
    float gyro_y;
    float gyro_z;
} mpu6050_data_t;

typedef struct {
    mpu6050_data_t* data;
    int64_t window_start;
    int64_t batch_start_us;
    int* t_offsets;
    int sample_count;
} mpu6050_payload_t;

esp_err_t mpu6050_payload_start(mpu6050_payload_t* const payload, mpu6050_payload_type_t type);
esp_err_t mpu6050_payload_is_full(const mpu6050_payload_t* const payload, mpu6050_payload_type_t type, uint8_t* const is_full);
esp_err_t mpu6050_payload_add_sample(mpu6050_payload_t* const payload, mpu6050_payload_type_t type,
                                     float ax, float ay, float az, float gx, float gy, float gz);

#ifdef __cplusplus
}
#endif

#endif