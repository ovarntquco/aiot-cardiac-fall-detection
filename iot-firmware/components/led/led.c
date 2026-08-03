#include <stdint.h>

#include "esp_check.h"
#include "esp_err.h"
#include "driver/ledc.h"
#include "freertos/FreeRTOS.h"
#include "freertos/projdefs.h"

#include "config.h"

#include "led.h"

esp_err_t led_init() {
    ledc_timer_config_t ledc_timer = {
        .speed_mode = LED_SPEED_MODE,
        .duty_resolution = LED_DUTY_RESOLUTION,
        .timer_num = LED_TIMER_NUM,
        .freq_hz = LED_FREQ_HZ,
        .clk_cfg = LED_CLK_CFG
    };
    
    ledc_channel_config_t ledc_channel = {
        .speed_mode = LED_SPEED_MODE,
        .channel = LED_LEDC_CHANNEL,
        .timer_sel = LED_TIMER_NUM,
        .gpio_num = LED_GPIO_NUM,
        .duty = 0,
        .hpoint = 0
    };
    
    ESP_RETURN_ON_ERROR(
        ledc_timer_config(&ledc_timer),
        BUZZER_TAG,
        "Failed to config led's ledc timer"
    );
    
    ESP_RETURN_ON_ERROR(
        ledc_channel_config(&ledc_channel),
        BUZZER_TAG,
        "Failed to config led's ledc channel"
    );

    return ESP_OK;
}

esp_err_t led_start() {
    ESP_RETURN_ON_ERROR(
        ledc_set_duty(LED_SPEED_MODE, LED_LEDC_CHANNEL, LED_DUTY),
        LED_TAG,
        "Failed to set led's duty cycle to start led"
    );

    ESP_RETURN_ON_ERROR(
        ledc_update_duty(LED_SPEED_MODE, LED_LEDC_CHANNEL),
        LED_TAG,
        "Failed to update duty cycle to start led"
    );

    return ESP_OK;
}

esp_err_t led_stop() {
    ESP_RETURN_ON_ERROR(
        ledc_set_duty(LED_SPEED_MODE, LED_LEDC_CHANNEL, 0),
        LED_TAG,
        "Failed to set led's duty cycle to stop led"
    );

    ESP_RETURN_ON_ERROR(
        ledc_update_duty(LED_SPEED_MODE, LED_LEDC_CHANNEL),
        LED_TAG,
        "Failed to update duty cycle to stop led"
    );

    ESP_RETURN_ON_ERROR(
        ledc_stop(LED_SPEED_MODE, LED_LEDC_CHANNEL, 0),
        LED_TAG,
        "Failed to stop ledc to stop led"
    );

    return ESP_OK;    
}

esp_err_t led_blink(uint32_t on_ms, uint32_t off_ms, int repeat) {
    for (int i = 0; i < repeat; ++i) {
        ESP_RETURN_ON_ERROR(
            led_start(),
            BUZZER_TAG,
            "Failed to start led"
        );

        vTaskDelay(pdMS_TO_TICKS(on_ms));

        ESP_RETURN_ON_ERROR(
            led_stop(),
            BUZZER_TAG,
            "Failed to stop led"
        );

        vTaskDelay(pdMS_TO_TICKS(off_ms));
    }
    return ESP_OK;
}
