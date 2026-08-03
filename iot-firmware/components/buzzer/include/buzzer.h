#ifndef BUZZER_HELPER_H
#define BUZZER_HELPER_H

#include <stdint.h>

#include "esp_err.h"

#ifdef __cplusplus
extern "C" {
#endif

esp_err_t buzzer_init();
esp_err_t buzzer_start(uint32_t frequency);
esp_err_t buzzer_beep(uint32_t frequency, uint32_t duration_ms);
esp_err_t buzzer_stop();

#ifdef __cplusplus
}
#endif

#endif