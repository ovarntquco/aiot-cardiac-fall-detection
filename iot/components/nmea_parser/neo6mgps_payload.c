#include "esp_log.h"

#include "time_sync.h"

#include "nmea_parser.h"
#include "neo6mgps_payload.h"

esp_err_t neo6mgps_payload_start(neo6mgps_payload_t* const payload) {
    if (NULL == payload) {
        ESP_LOGE(NEO6MGPS_TAG, "Failed to start neo6mgps payload");
        return ESP_ERR_INVALID_ARG;
    }

    payload->recorded_at = get_epoch_ms_now();
    payload->sample_count = 0;
    return ESP_OK;
}

esp_err_t neo6mgps_payload_add_sample(neo6mgps_payload_t* const payload, float latitude, float longitude) {
    if (NULL == payload) {
        ESP_LOGE(NEO6MGPS_TAG, "Failed to start neo6mgps payload");
        return ESP_ERR_INVALID_ARG;
    }

    payload->latitude = latitude;
    payload->longitude = longitude;
    ++payload->sample_count;
    return ESP_OK;
}