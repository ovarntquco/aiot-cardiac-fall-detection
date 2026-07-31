#include "esp_log.h"
#include "esp_timer.h"

#include "config.h"
#include "time_sync.h"

#include "mpu6050_batch.h"

void mpu6050_batch_start(mpu6050_batch_t* batch) {
    get_iso8601_now(batch->window_start_iso, sizeof(batch->window_start_iso));
    batch->batch_start_us = esp_timer_get_time();
    batch->sample_count = 0;
}

bool mpu6050_batch_is_full(mpu6050_batch_t* batch) {
    return batch->sample_count >= MOTION_BATCH_SIZE;
}

void mpu6050_batch_add_sample(mpu6050_batch_t *batch, float ax, float ay, float az,
                             float gx, float gy, float gz) {
    if (mpu6050_batch_is_full(batch)) {
        ESP_LOGW(MPU6050_TAG, "Batch full but not yet published - dropping sample");
        return;
    }

    int i = batch->sample_count;
    batch->t_offsets[i] = (uint16_t) ((esp_timer_get_time() - batch->batch_start_us) / 1000);

    batch->acce_x[i] = ax; batch->acce_y[i] = ay; batch->acce_z[i] = az;
    batch->gyro_x[i] = gx; batch->gyro_y[i] = gy; batch->gyro_z[i] = gz;

    batch->sample_count++;
}
