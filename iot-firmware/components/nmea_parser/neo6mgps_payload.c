#include "neo6mgps_payload.h"

#include "time_sync.h"

void neo6mgps_payload_start(neo6mgps_payload_t *payload) {
    get_iso8601_now(payload->recorded_at, sizeof(payload->recorded_at));
    payload->sample_count = 0;
}

void neo6mgps_payload_add_sample(neo6mgps_payload_t *payload, float latitude, float longitude) {
    payload->latitude = latitude;
    payload->longitude = longitude;

    ++payload->sample_count;
}