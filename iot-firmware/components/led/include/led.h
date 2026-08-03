#ifndef LED_H
#define LED_H

#include <stdint.h>

#include "esp_err.h"

#ifdef __cplusplus
extern "C" {
#endif

esp_err_t led_init();
esp_err_t led_start();
esp_err_t led_blink(uint32_t on_ms, uint32_t off_ms, int repeat);
esp_err_t led_stop();

#ifdef __cplusplus
}
#endif

#endif