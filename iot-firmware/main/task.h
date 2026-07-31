#ifndef TASK_H
#define TASK_H

#include "esp_event_base.h"

#ifdef __cplusplus
extern "C" {
#endif

void max30102_task(void* pvParameters);
void mpu6050_task(void* pvParameters);
void oled_task(void* pv_parameters);
void gps_event_handler(void *event_handler_arg, esp_event_base_t event_base, int32_t event_id, void *event_data);

#ifdef __cplusplus
}
#endif

#endif