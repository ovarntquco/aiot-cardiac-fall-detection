#ifndef EVENT_PAYLOAD_H
#define EVENT_PAYLOAD_H

#include "esp_err.h"

#ifdef __cplusplus
extern "C" {
#endif

#define EVENT_PAYLOAD_TAG "EVENT_PAYLOAD"

typedef enum {
    EVENT_PAYLOAD_SYSTEM = 0,
    EVENT_PAYLOAD_USER   = 1,
} event_source_t;

typedef struct {
    int64_t recorded_at;
    event_source_t type;
} event_payload_t;

char*       event_payload_source_to_str(event_source_t type);
esp_err_t   event_payload_start(event_payload_t* const payload);
esp_err_t   event_payload_add_sample(event_payload_t* const payload, event_source_t type);

#ifdef __cplusplus
}
#endif

#endif