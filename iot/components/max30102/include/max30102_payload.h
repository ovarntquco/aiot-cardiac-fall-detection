#ifndef MAX30102_PAYLOAD_H
#define MAX30102_PAYLOAD_H

#include "esp_err.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    int heart_rate;
    int sample_count;
    int spo2;
    int64_t recorded_at;
} max30102_payload_t;

esp_err_t max30102_payload_start(max30102_payload_t* const payload);
esp_err_t max30102_payload_add_sample(max30102_payload_t* const payload, int heart_rate, int spo2);

#ifdef __cplusplus
}
#endif

#endif