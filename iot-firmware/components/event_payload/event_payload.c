#include <string.h>

#include "time_sync.h"

#include "event_payload.h"

void event_payload_start(event_payload_t* payload) {
    get_iso8601_now(payload->recorded_at, sizeof(payload->recorded_at));
}

void event_payload_add_sample(event_payload_t* payload, char* type) {
    strncpy(payload->type, type, strlen(type));
    payload->type[strlen(type) + 1] = '\0';
}