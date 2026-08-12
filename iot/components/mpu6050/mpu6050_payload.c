#include <stdlib.h>

#include "esp_log.h"
#include "esp_timer.h"

#include "model_metadata.h"
#include "time_sync.h"

#include "mpu6050.h"
#include "mpu6050_payload.h"

esp_err_t mpu6050_payload_start(mpu6050_payload_t* const payload, mpu6050_payload_type_t type) {
    if (NULL == payload) {
        ESP_LOGE(MPU6050_TAG, "Failed to start mpu6050 payload, payload is NULL");
        return ESP_ERR_INVALID_ARG;
    }

    size_t data_size = 0;
    switch (type) {
        case MPU6050_PAYLOAD_INFER:
            data_size = EI_CLASSIFIER_RAW_SAMPLE_COUNT;
            payload->t_offsets = NULL;
            break;
        case MPU6050_PAYLOAD_MQTT:
            data_size = MOTION_BATCH_SIZE;
            payload->t_offsets = calloc(data_size, sizeof(*payload->t_offsets));
            break;
        default:
            break;
    }

    if (NULL == payload->t_offsets && MPU6050_PAYLOAD_MQTT == type) {
        ESP_LOGE(MPU6050_TAG, "Failed to allocate payload time-offsets buffer");
        return ESP_ERR_NO_MEM;
    }

    payload->data = calloc(data_size, sizeof(*payload->data));
    if (NULL == payload->data) {
        ESP_LOGE(MPU6050_TAG, "Failed to allocate payload data buffer");
        free(payload->t_offsets);
        payload->t_offsets = NULL;
        return ESP_ERR_NO_MEM;
    }
    payload->window_start = get_epoch_ms_now();
    payload->batch_start_us = esp_timer_get_time();
    payload->sample_count = 0;
    return ESP_OK;
}

esp_err_t mpu6050_payload_is_full(const mpu6050_payload_t* const payload, mpu6050_payload_type_t type, uint8_t* const is_full) {
    if (NULL == payload) {
        ESP_LOGE(MPU6050_TAG, "Failed to check whether payload is full, payload is NULL");
        return ESP_ERR_INVALID_ARG;
    }
    
    size_t data_size = 0;
    switch (type) {
        case MPU6050_PAYLOAD_INFER:
            data_size = EI_CLASSIFIER_RAW_SAMPLE_COUNT;
            break;
        case MPU6050_PAYLOAD_MQTT:
            data_size = MOTION_BATCH_SIZE;
            break;
        default:
            break;
    }
    *is_full = payload->sample_count >= data_size;
    return ESP_OK;
}

esp_err_t mpu6050_payload_add_sample(mpu6050_payload_t* const payload, mpu6050_payload_type_t type,
                                     float ax, float ay, float az, float gx, float gy, float gz) {
    uint8_t is_full = 0;
    esp_err_t ret = mpu6050_payload_is_full(payload, type, &is_full);
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to check whether payload is full during add-sample: %s", esp_err_to_name( ret));
        return ret;
    }

    if (is_full) {
        ESP_LOGW(MPU6050_TAG, "Payload is full but not yet published, dropping sample");
        return ESP_OK;
    }

    int i = payload->sample_count;
    if (MPU6050_PAYLOAD_MQTT == type){
        payload->t_offsets[i] = (uint16_t) ((esp_timer_get_time() - payload->batch_start_us) / 1000);
    }
    payload->data[i].acce_x = ax; payload->data[i].acce_y = ay; payload->data[i].acce_z = az;
    payload->data[i].gyro_x = gx; payload->data[i].gyro_y = gy; payload->data[i].gyro_z = gz;
    ++payload->sample_count;
    return ESP_OK;
}
