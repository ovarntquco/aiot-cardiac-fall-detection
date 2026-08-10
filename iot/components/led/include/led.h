#ifndef LED_H
#define LED_H

#include "esp_err.h"

#ifdef __cplusplus
extern "C" {
#endif

#define LED_TAG "LED"

esp_err_t led_init(void);
void led_deinit(void);
esp_err_t led_start(void);
esp_err_t led_blink(uint32_t on_ms, uint32_t off_ms, int repeat);
esp_err_t led_stop(void);

#ifdef __cplusplus
}
#endif

#endif