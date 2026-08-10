#ifndef BUZZER_HELPER_H
#define BUZZER_HELPER_H

#include "esp_err.h"

#ifdef __cplusplus
extern "C" {
#endif

#define BUZZER_TAG "BUZZER"

esp_err_t   buzzer_init(void);
void        buzzer_deinit(void);
esp_err_t   buzzer_start(uint32_t frequency);
esp_err_t   buzzer_beep(uint32_t frequency);
esp_err_t   buzzer_stop(void);

#ifdef __cplusplus
}
#endif

#endif