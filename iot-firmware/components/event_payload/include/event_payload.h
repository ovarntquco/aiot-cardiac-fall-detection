#ifndef EVENT_PAYLOAD_H
#define EVENT_PAYLOAD_H

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    char recorded_at[32];
    char type[7];
} event_payload_t;

void event_payload_start(event_payload_t* payload);
void event_payload_add_sample(event_payload_t* payload, char* type);

#ifdef __cplusplus
}
#endif

#endif