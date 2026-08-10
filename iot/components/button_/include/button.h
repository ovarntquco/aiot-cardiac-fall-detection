#ifndef BUTTON_HELPER_H
#define BUTTON_HELPER_H

#include "esp_err.h"

#include "button_types.h"
#include "iot_button.h"

#ifdef __cplusplus 
extern "C" {
#endif

#define BUTTON_TAG "BUTTON"

esp_err_t   button_init(button_handle_t* const btn, button_cb_t cb);
void        button_deinit(button_handle_t btn);

#ifdef __cplusplus
}
#endif

#endif