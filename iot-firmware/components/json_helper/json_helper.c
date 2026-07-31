#include "cJSON.h"

#include "config.h"
#include "neo6mgps_payload.h"

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