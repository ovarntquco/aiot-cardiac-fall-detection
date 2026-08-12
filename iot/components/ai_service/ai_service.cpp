#include <string.h>
#include <sys/types.h>

#include "esp_log.h"

#include "edge-impulse-sdk/classifier/ei_run_classifier.h"
#include "edge-impulse-sdk/dsp/numpy.hpp"
#include "ei_classifier_types.h"
#include "model_metadata.h"

#include "numpy_types.h"

#include "ai_service.h"

static float flatten_sample[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE];

extern "C" esp_err_t inference(const mpu6050_payload_t* payload, uint8_t* const is_fall) {
    if (NULL == payload && NULL == is_fall) {
        ESP_LOGE(INFERENCE_TAG, "Failed to inference, payload is NULL");
        return ESP_ERR_INVALID_ARG;
    }

    if (EI_CLASSIFIER_RAW_SAMPLE_COUNT != payload->sample_count) {
        ESP_LOGE(INFERENCE_TAG, "Failed to inference, payload sample's count must be %d", EI_CLASSIFIER_RAW_SAMPLE_COUNT);
        return ESP_ERR_INVALID_SIZE;
    }

    int index = 0;
    for (int i = 0; i < payload->sample_count; ++i) {
        flatten_sample[index++] = payload->data[i].acce_x;
        flatten_sample[index++] = payload->data[i].acce_y;
        flatten_sample[index++] = payload->data[i].acce_z;
        
        flatten_sample[index++] = payload->data[i].gyro_x;
        flatten_sample[index++] = payload->data[i].gyro_y;
        flatten_sample[index++] = payload->data[i].gyro_z;
    }

    if (index != EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE) {
        ESP_LOGE(INFERENCE_TAG, "Failed to inference, sample's index must be %d", EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE);
        return ESP_ERR_INVALID_SIZE;
    }

    ei::ei_signal_t ei_signal = {};    
    int signal_error = ei::numpy::signal_from_buffer(flatten_sample, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, &ei_signal);
    if (signal_error != 0) {
        ESP_LOGE(INFERENCE_TAG, "Failed to inference, signal error code: %d", signal_error);
        return ESP_FAIL;
    }
    
    ei_impulse_result_t result = {};
    EI_IMPULSE_ERROR inference_error = run_classifier(&ei_signal, &result, false);
    if (inference_error != EI_IMPULSE_OK) {
        ESP_LOGE(INFERENCE_TAG, "Failed to inference, run-classifier error");
        return ESP_FAIL;
    }

    *is_fall = false;
    for (int i = 0; i < EI_CLASSIFIER_LABEL_COUNT; ++i) {
        if (0 == strcmp(result.classification[i].label, "fall") &&
            result.classification[i].value >= 0.8) {
            *is_fall = true;
        }
    }

    return ESP_OK;
}
