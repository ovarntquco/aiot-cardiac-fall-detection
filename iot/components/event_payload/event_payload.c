#include "esp_log.h"

#include "time_sync.h"

#include "event_payload.h"

char* event_payload_source_to_str(event_source_t type) {
    switch (type) {
        case EVENT_PAYLOAD_SYSTEM:
            return "system";
        case EVENT_PAYLOAD_USER:
            return "user";
        default:
            return "unknown";
    }
}

esp_err_t event_payload_start(event_payload_t* const payload) {
    if (NULL == payload) {
        ESP_LOGE(EVENT_PAYLOAD_TAG, "Failed to start event payload, payload is NULL");
        return ESP_ERR_INVALID_ARG;
    }
    payload->recorded_at = get_epoch_ms_now();
    return ESP_OK;
}

esp_err_t event_payload_add_sample(event_payload_t* const payload, event_source_t type) {
    if (NULL == payload) {
        ESP_LOGE(EVENT_PAYLOAD_TAG, "Failed to add event payload sample, payload is NULL");
        return ESP_ERR_INVALID_ARG;
    }
    payload->type = type;
    return ESP_OK;
}