#include "button_types.h"
#include "esp_err.h"
#include "esp_log.h"

#include "button_gpio.h"
#include "iot_button.h"

#include "button.h"

#define BUTTON_ACTIVE_LEVEL     (0)
#define BUTTON_GPIO_NUM         (2)
#define BUTTON_LONG_PRESS_TIME  (2000)

esp_err_t button_init(button_handle_t* const btn, button_cb_t cb) {
    if (NULL == btn || NULL == cb) {
        ESP_LOGE(BUTTON_TAG, "Failed to init button, btn or cb iS NULL");
        return ESP_ERR_INVALID_ARG;
    }

    button_config_t btn_cfg = {0};
    button_gpio_config_t btn_gpio_cfg = {
        .gpio_num = BUTTON_GPIO_NUM,
        .active_level = BUTTON_ACTIVE_LEVEL,
    };
    button_event_args_t args = {
        .long_press.press_time = BUTTON_LONG_PRESS_TIME,
    };

    esp_err_t ret = iot_button_new_gpio_device(&btn_cfg, &btn_gpio_cfg, btn);
    if (ret != ESP_OK) {
        ESP_LOGE(BUTTON_TAG, "Failed to add button gpio's device: %s", esp_err_to_name(ret));
        return ret;
    }

    ret = iot_button_register_cb(*btn, BUTTON_SINGLE_CLICK, NULL, cb, NULL);
    if (ret != ESP_OK) {
        ESP_LOGE(BUTTON_TAG, "Failed to register single-click handler: %s", esp_err_to_name(ret));
        goto cleanup;
    }

    ret = iot_button_register_cb(*btn, BUTTON_DOUBLE_CLICK, NULL, cb, NULL);
    if (ret != ESP_OK) {
        ESP_LOGE(BUTTON_TAG, "Failed to register double-click handler: %s", esp_err_to_name(ret));
        goto cleanup;
    }

    ret = iot_button_register_cb(*btn, BUTTON_LONG_PRESS_START, &args, cb, NULL);
    if (ret != ESP_OK) {
        ESP_LOGE(BUTTON_TAG, "Failed to register long-press-start handler: %s", esp_err_to_name(ret));
        goto cleanup;
    }
    return ESP_OK;

cleanup:
    iot_button_delete(*btn);
    *btn = NULL;
    return ret;
}

void button_deinit(button_handle_t btn) {
    if (btn) {
        esp_err_t ret = iot_button_delete(btn);
        if (ret != ESP_OK) {
            ESP_LOGE(BUTTON_TAG, "Failed to delete button during deinit: %s", esp_err_to_name(ret));
        }
    }
}
