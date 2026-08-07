#include "include/ai_service.h"
#include "ei_classifier_types.h"
#include "esp_err.h"
#include "model_metadata.h"
#include "../../ai_service/edge-impulse-sdk/dsp/numpy.hpp"
#include "../../ai_service/edge-impulse-sdk/classifier/ei_run_classifier.h"
#include <cstring>

static float flatten_sample[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE];

esp_err_t inference(const mpu6050_payload_t* payload, ei_impulse_result_t* result) {
    if (NULL == payload) {
        return ESP_ERR_INVALID_ARG;
    }

    if (EI_CLASSIFIER_RAW_SAMPLE_COUNT != payload->sample_count) {
        return ESP_ERR_INVALID_SIZE;
    }

    int index = 0;

    for (int i = 0; i < payload->sample_count; ++i) {
        flatten_sample[index++] = payload->acce_x[i];
        flatten_sample[index++] = payload->acce_y[i];
        flatten_sample[index++] = payload->acce_z[i];

        flatten_sample[index++] = payload->gyro_x[i];
        flatten_sample[index++] = payload->gyro_y[i];
        flatten_sample[index++] = payload->gyro_z[i];
    }

    if (EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE != index) {
        return ESP_ERR_INVALID_SIZE;
    }
    
    signal_t signal = {};

    int signal_error = ei::numpy::signal_from_buffer(flatten_sample, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, &signal);

    if (0 != signal_error) {
        return ESP_FAIL;
    }

    EI_IMPULSE_ERROR inference_error = run_classifier(&signal, result, false);

    if (EI_IMPULSE_OK != inference_error) {
        return ESP_FAIL;
    }

    return ESP_OK;
}

bool is_fall(ei_impulse_result_t *result) {
    if (NULL == result) {
        return false;
    }

    for (int i = 0; i < EI_CLASSIFIER_LABEL_COUNT; ++i) {
        if (strcmp(result->classification[i].label, "fall") && result->classification[i].value >= 0.5) {
            return true;
        }
    }

    return false;
}
