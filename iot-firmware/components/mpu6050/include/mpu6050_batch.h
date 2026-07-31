#ifndef MPU6050_BATCH_H
#define MPU6050_BATCH_H

#include <stdint.h>

#include "config.h"

#ifdef __cplusplus 
extern "C" {
#endif

typedef struct {
    char window_start_iso[32];
    int64_t batch_start_us;
    int t_offsets[MOTION_BATCH_SIZE];
    int sample_count;
    float acce_x[MOTION_BATCH_SIZE];
    float acce_y[MOTION_BATCH_SIZE];
    float acce_z[MOTION_BATCH_SIZE];
    float gyro_x[MOTION_BATCH_SIZE];
    float gyro_y[MOTION_BATCH_SIZE];
    float gyro_z[MOTION_BATCH_SIZE];
} mpu6050_batch_t;

void mpu6050_batch_start(mpu6050_batch_t* batch);
bool mpu6050_batch_is_full(mpu6050_batch_t* batch);
void mpu6050_batch_add_sample(mpu6050_batch_t *batch, float ax, float ay, float az,
                              float gx, float gy, float gz);

#ifdef __cplusplus
}
#endif

#endif