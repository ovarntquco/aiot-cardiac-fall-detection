#include "cJSON.h"

#include "config.h"

#include "json_helper.h"

char* json_convert_motion(const mpu6050_batch_t* batch) {
    cJSON* root = cJSON_CreateObject();
    
    cJSON_AddStringToObject(root, "deviceId", DEVICE_ID);
    cJSON_AddStringToObject(root, "windowStart", batch->window_start_iso);
    cJSON_AddNumberToObject(root, "sampleRateHz", MOTION_BATCH_SIZE);

    cJSON* t_offsets_arr = cJSON_CreateIntArray(batch->t_offsets, batch->sample_count);
    
    cJSON_AddItemToObject(root, "tOffsets", t_offsets_arr);

    struct { const char* key; const float* data; } float_fields[] = {
        { "acceX", batch->acce_x },
        { "acceY", batch->acce_y },
        { "acceZ", batch->acce_z },
        { "gyroX", batch->gyro_x },
        { "gyroY", batch->gyro_y },
        { "gyroZ", batch->gyro_z },
    };

    for (size_t i = 0; i < sizeof(float_fields) / sizeof(float_fields[0]); ++i) {
        cJSON_AddItemToObject(root, float_fields[i].key, 
                              cJSON_CreateFloatArray(float_fields[i].data, batch->sample_count));
    }
    
    char* payload = cJSON_PrintUnformatted(root);
    cJSON_Delete(root);
    return payload;
}
