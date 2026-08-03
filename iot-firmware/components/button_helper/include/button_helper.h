#ifndef BUTTON_HELPER_H
#define BUTTON_HELPER_H

#include "esp_err.h"

#include "button_types.h"
#include "iot_button.h"

#ifdef __cplusplus 
extern "C" {
#endif

esp_err_t button_init(button_handle_t* btn, button_cb_t cb);

#ifdef __cplusplus
}
#endif

#endif