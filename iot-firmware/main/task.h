#ifndef TASK_H
#define TASK_H

#include "esp_event_base.h"
#include "esp_timer.h"

#ifdef __cplusplus
extern "C" {
#endif

void max30102_task(void* pvParameters);
void mpu6050_task(void* pvParameters);
void oled_task(void* pv_parameters);
void gps_event_handler(void *event_handler_arg, esp_event_base_t event_base, int32_t event_id, void *event_data);
void button_event_cb(void *arg, void *data);
void confirm_timeout_cb(void* arg);
esp_timer_handle_t get_confirm_timer();


#ifdef __cplusplus
}
#endif

#endif