#include "esp_log.h"
#include "esp_timer.h"

#include "config.h"
#include "time_sync.h"

#include "mpu6050_payload.h"

void mpu6050_mqtt_payload_start(mpu6050_mqtt_payload_t* payload) {
    get_iso8601_now(payload->window_start_iso, sizeof(payload->window_start_iso));
    payload->batch_start_us = esp_timer_get_time();
    payload->sample_count = 0;
}

bool mpu6050_mqtt_payload_is_full(mpu6050_mqtt_payload_t* payload) {
    return payload->sample_count >= MOTION_BATCH_SIZE;
}

void mpu6050_mqtt_payload_add_sample(mpu6050_mqtt_payload_t *payload, float ax, float ay, float az,
                                float gx, float gy, float gz) {
    if (mpu6050_mqtt_payload_is_full(payload)) {
        ESP_LOGW(MPU6050_TAG, "payload full but not yet published - dropping sample");
        return;
    }

    int i = payload->sample_count;
    payload->t_offsets[i] = (uint16_t) ((esp_timer_get_time() - payload->batch_start_us) / 1000);

    payload->acce_x[i] = ax; payload->acce_y[i] = ay; payload->acce_z[i] = az;
    payload->gyro_x[i] = gx; payload->gyro_y[i] = gy; payload->gyro_z[i] = gz;

    ++payload->sample_count;
}

void mpu6050_infer_payload_start(mpu6050_infer_payload_t* payload) {
    payload->sample_count = 0;
}

bool mpu6050_infer_payload_is_full(mpu6050_infer_payload_t* payload) {
    return payload->sample_count >= EI_CLASSIFIER_RAW_SAMPLE_COUNT;
}

void mpu6050_infer_payload_add_sample(mpu6050_infer_payload_t *payload, float ax, float ay, float az,
                                float gx, float gy, float gz) {
    if (mpu6050_infer_payload_is_full(payload)) {
        ESP_LOGW(MPU6050_TAG, "payload full but not yet published - dropping sample");
        return;
    }

    int i = payload->sample_count;
    
    payload->acce_x[i] = ax; payload->acce_y[i] = ay; payload->acce_z[i] = az;
    payload->gyro_x[i] = gx; payload->gyro_y[i] = gy; payload->gyro_z[i] = gz;

    ++payload->sample_count;
}
