#include "ai_service.h"
#include "edge-impulse-sdk/classifier/ei_run_classifier_c.h"
#include "config.h"

#include <stdlib.h>
#include <cstdlib>

float *standard_scaler(const mpu6050_payload_t *payload) {
    if (nullptr == payload) {
        return nullptr;
    }

    if (EI_CLASSIFIER_RAW_SAMPLE_COUNT != payload->sample_count) {
        return nullptr;
    }

    float* output = (float*) std::malloc(EI_CLASSIFIER_RAW_SAMPLE_COUNT * MOTION_SAMPLE_RATE_HZ * EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE);
    int index = 0;

    for (int i = 0; i < payload->sample_count; ++i) {
        output[index++] = payload->acce_x[i];
        output[index++] = payload->acce_y[i];
        output[index++] = payload->acce_z[i];

        output[index++] = payload->gyro_x[i];
        output[index++] = payload->gyro_y[i];
        output[index++] = payload->gyro_z[i];
    }

    if (EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE != index) {
        std::free(output);

        return nullptr;
    }
}