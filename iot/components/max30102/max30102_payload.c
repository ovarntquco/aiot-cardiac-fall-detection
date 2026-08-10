#include "esp_err.h"
#include "esp_log.h"

#include "time_sync.h"

#include "max30102.h"
#include "max30102_payload.h"

esp_err_t max30102_payload_start(max30102_payload_t* const payload) {
    if (NULL == payload) {
        ESP_LOGE(MAX30102_TAG, "Failed to start max30102 payload, payload is NULL");
        return ESP_ERR_INVALID_ARG;
    }
    payload->recorded_at = get_epoch_ms_now();
    payload->sample_count = 0;
    return ESP_OK;
}

esp_err_t max30102_payload_add_sample(max30102_payload_t* const payload, int heart_rate, int spo2) {
    if (NULL == payload) {
        ESP_LOGE(MAX30102_TAG, "Failed to add max30102 payload, payload is NULL");
        return ESP_ERR_INVALID_ARG;
    }
    payload->heart_rate = heart_rate;
    payload->spo2 = spo2;
    ++payload->sample_count;
    return ESP_OK;
}
