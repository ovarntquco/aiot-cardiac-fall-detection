#ifndef NEO6MGPS_PAYLOAD_H
#define NEO6MGPS_PAYLOAD_H

#include "esp_err.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    int64_t recorded_at;
    float latitude;
    float longitude;
    int sample_count;
} neo6mgps_payload_t;

esp_err_t neo6mgps_payload_start(neo6mgps_payload_t* const payload);
esp_err_t neo6mgps_payload_add_sample(neo6mgps_payload_t* const payload, float latitude, float longitude);

#ifdef __cplusplus
}
#endif

#endif