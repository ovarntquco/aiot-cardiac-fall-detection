#include "esp_check.h"

#include "button_gpio.h"
#include "button_types.h"
#include "iot_button.h"

#include "config.h"

#include "button_helper.h"

esp_err_t button_init(button_handle_t* btn, button_cb_t cb) {
    button_config_t btn_cfg = {0};
    button_gpio_config_t btn_gpio_cfg = {
        .gpio_num = BUTTON_GPIO_NUM,
        .active_level = BUTTON_ACTIVE_LEVEL,
    };
    button_event_args_t args = {
        .long_press.press_time = BUTTON_LONG_PRESS_TIME,
    };

    ESP_RETURN_ON_ERROR(
        iot_button_new_gpio_device(&btn_cfg, &btn_gpio_cfg, btn),
        BUTTON_TAG,
        "Failed to add button gpio's device"
    );
    
    ESP_RETURN_ON_ERROR(
        iot_button_register_cb(*btn, BUTTON_SINGLE_CLICK, NULL, cb, NULL),
        BUTTON_TAG,
        "Failed to register button's single-click event handler"
    );
    
    ESP_RETURN_ON_ERROR(
        iot_button_register_cb(*btn, BUTTON_DOUBLE_CLICK, NULL, cb, NULL),
        BUTTON_TAG,
        "Failed to register button's double-click event handler"
    );

    ESP_RETURN_ON_ERROR(
        iot_button_register_cb(*btn, BUTTON_LONG_PRESS_START, &args, cb, NULL),
        BUTTON_TAG,
        "Failed to register button's long-press-start event handler"
    );

    return ESP_OK;
}
