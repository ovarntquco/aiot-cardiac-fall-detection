#include <stdlib.h>
#include <string.h>

#include "cJSON.h"
#include "esp_log.h"

#include "config.h"

#include "json_helper.h"

char* json_convert_cardiac(const max30102_payload_t* p) {
    cJSON* root = cJSON_CreateObject();

    cJSON_AddStringToObject(root, "deviceId", DEVICE_ID);
    cJSON_AddStringToObject(root, "recordedAt", p->recorded_at);
    cJSON_AddNumberToObject(root, "heartRate", p->heart_rate);
    cJSON_AddNumberToObject(root, "spo2", p->spo2);

    char* payload = cJSON_PrintUnformatted(root);
    cJSON_Delete(root);
    return payload;
}

char* json_convert_motion(const mpu6050_payload_t* p) {
    cJSON* root = cJSON_CreateObject();
    
    cJSON_AddStringToObject(root, "deviceId", DEVICE_ID);
    cJSON_AddStringToObject(root, "windowStart", p->window_start_iso);
    cJSON_AddNumberToObject(root, "sampleRateHz", MOTION_BATCH_SIZE);

    cJSON* t_offsets_arr = cJSON_CreateIntArray(p->t_offsets, p->sample_count);
    
    cJSON_AddItemToObject(root, "tOffsets", t_offsets_arr);

    struct { const char* key; const float* data; } float_fields[] = {
        { "acceX", p->acce_x },
        { "acceY", p->acce_y },
        { "acceZ", p->acce_z },
        { "gyroX", p->gyro_x },
        { "gyroY", p->gyro_y },
        { "gyroZ", p->gyro_z },
    };

    for (size_t i = 0; i < sizeof(float_fields) / sizeof(float_fields[0]); ++i) {
        cJSON_AddItemToObject(root, float_fields[i].key, 
                              cJSON_CreateFloatArray(float_fields[i].data, p->sample_count));
    }
    
    char* payload = cJSON_PrintUnformatted(root);
    cJSON_Delete(root);
    return payload;
}

char* json_convert_gps(const neo6mgps_payload_t* p) {
    cJSON* root = cJSON_CreateObject();

    cJSON_AddStringToObject(root, "deviceId", DEVICE_ID);
    cJSON_AddStringToObject(root, "recordedAt", p->recorded_at);
    cJSON_AddNumberToObject(root, "latitude", p->latitude);
    cJSON_AddNumberToObject(root, "longitude", p->longitude);

    char* payload = cJSON_PrintUnformatted(root);
    cJSON_Delete(root);
    return payload;
}

char* json_convert_event(const event_payload_t* p) {
    cJSON* root = cJSON_CreateObject();

    cJSON_AddStringToObject(root, "deviceId", DEVICE_ID);
    cJSON_AddStringToObject(root, "recordedAt", p->recorded_at);
    cJSON_AddStringToObject(root, "type", p->type);

    char* payload = cJSON_PrintUnformatted(root);
    cJSON_Delete(root);
    return payload;
}

static bool json_get_int(cJSON* root, const char* key, int* out) {
    cJSON* item = cJSON_GetObjectItem(root, key);

    if (!cJSON_IsNumber(item)) {
        return false;
    }

    *out = item->valueint;

    return true;
}

static bool json_get_char(cJSON* root, const char* key, char* out, size_t out_size) {
    cJSON* item = cJSON_GetObjectItem(root, key);

    if (!cJSON_IsString(item) || item->valuestring == NULL) {
        return false;
    }

    strncpy(out, item->valuestring, out_size - 1);
    out[out_size - 1] = '\0';

    return true;
}

vital_payload_t json_parse_vitals(const char* const data, size_t data_len) {
    cJSON* root = cJSON_ParseWithLength(data, data_len);

    if (root == NULL) {
        ESP_LOGE("JSON_HELPER", "Failed to parse JSON vitals payload");
        return (vital_payload_t) {NULL, 0, 0, -999};
    }

    char device_id[37];
    int hr_low, hr_high, spo2_low;
    vital_payload_t payload = {
        .hr_low = json_get_int(root, "hrLow", &hr_low) ? hr_low : 60,
        .hr_high = json_get_int(root, "hrHigh",&hr_high) ? hr_high : 100,
        .spo2_low = json_get_int(root, "spo2Low", &spo2_low) ? spo2_low : 80
    };
    
    if (json_get_char(root, "deviceId", device_id, sizeof(device_id))) {
        payload.device_id = malloc(sizeof(device_id));
        strncpy(payload.device_id, device_id, sizeof(device_id) - 1);
        payload.device_id[sizeof(device_id) - 1] = '\0';
    } else {
        payload.device_id = NULL;
    }

    cJSON_Delete(root);

    return payload;
}
