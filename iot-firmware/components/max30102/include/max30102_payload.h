#ifndef MAX30102_PAYLOAD_H
#define MAX30102_PAYLOAD_H

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    int heart_rate;
    int spo2;
    char recorded_at[32];
    int sample_count;
} max30102_payload_t;

void max30102_payload_start(max30102_payload_t* payload);
void max30102_payload_add_sample(max30102_payload_t* payload, int heart_rate, int spo2);

#ifdef __cplusplus
}
#endif

#endif