#ifndef NEO6MGPS_PAYLOAD_H
#define NEO6MGPS_PAYLOAD_H

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    char recorded_at[32];
    float latitude;
    float longitude;
    int sample_count;
} neo6mgps_payload_t;

void neo6mgps_payload_start(neo6mgps_payload_t* payload);
void neo6mgps_payload_add_sample(neo6mgps_payload_t* payload, float latitude, float longitude);

#ifdef __cplusplus
}
#endif

#endif