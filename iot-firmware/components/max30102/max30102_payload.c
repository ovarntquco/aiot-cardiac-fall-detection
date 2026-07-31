#include "time_sync.h"

#include "max30102_payload.h"

void max30102_payload_start(max30102_payload_t* payload) {
    get_iso8601_now(payload->recorded_at, sizeof(payload->recorded_at));
    payload->sample_count = 0;
}

void max30102_payload_add_sample(max30102_payload_t* payload, int heart_rate, int spo2) {
    payload->heart_rate = heart_rate;
    payload->spo2 = spo2;

    ++payload->sample_count;
}