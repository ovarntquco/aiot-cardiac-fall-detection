#include <stdint.h>

#include "esp_check.h"
#include "esp_err.h"
#include "driver/ledc.h"
#include "freertos/FreeRTOS.h"
#include "freertos/projdefs.h"

#include "config.h"

#include "buzzer.h"

esp_err_t buzzer_init() {
    ledc_timer_config_t ledc_timer = {
        .speed_mode = BUZZER_SPEED_MODE,
        .duty_resolution = BUZZER_DUTY_RESOLUTION,
        .timer_num = BUZZER_TIMER_NUM,
        .freq_hz = BUZZER_FREQ_HZ,
        .clk_cfg = BUZZER_CLK_CFG
    };
    
    ledc_channel_config_t ledc_channel = {
        .speed_mode = BUZZER_SPEED_MODE,
        .channel = BUZZER_LEDC_CHANNEL,
        .timer_sel = BUZZER_TIMER_NUM,
        .gpio_num = BUZZER_GPIO_NUM,
        .duty = 0,
        .hpoint = 0
    };
    
    ESP_RETURN_ON_ERROR(
        ledc_timer_config(&ledc_timer),
        BUZZER_TAG,
        "Failed to config buzzer's ledc timer"
    );
    
    ESP_RETURN_ON_ERROR(
        ledc_channel_config(&ledc_channel),
        BUZZER_TAG,
        "Failed to config buzzer's ledc channel"
    );

    return ESP_OK;
}

esp_err_t buzzer_start(uint32_t frequency) {
    ESP_RETURN_ON_ERROR(
        ledc_set_duty(BUZZER_SPEED_MODE, BUZZER_LEDC_CHANNEL, BUZZER_DUTY),
        BUZZER_TAG,
        "Failed to set buzzer's duty cycle to start buzzer"
    );

    ESP_RETURN_ON_ERROR(
        ledc_update_duty(BUZZER_SPEED_MODE, BUZZER_LEDC_CHANNEL),
        BUZZER_TAG,
        "Failed to update duty cycle to start buzzer"
    );

    ESP_RETURN_ON_ERROR(
        ledc_set_freq(BUZZER_SPEED_MODE, BUZZER_TIMER_NUM, frequency),
        BUZZER_TAG,
        "Failed to set frequency to start buzzer"
    );

    return ESP_OK;
}

esp_err_t buzzer_stop() {
    ESP_RETURN_ON_ERROR(
        ledc_set_duty(BUZZER_SPEED_MODE, BUZZER_LEDC_CHANNEL, 0),
        BUZZER_TAG,
        "Failed to set buzzer's duty cycle to stop buzzer"
    );

    ESP_RETURN_ON_ERROR(
        ledc_update_duty(BUZZER_SPEED_MODE, BUZZER_LEDC_CHANNEL),
        BUZZER_TAG,
        "Failed to update duty cycle to stop buzzer"
    );

    ESP_RETURN_ON_ERROR(
        ledc_stop(BUZZER_SPEED_MODE, BUZZER_LEDC_CHANNEL, 0),
        BUZZER_TAG,
        "Failed to stop ledc to stop buzzer"
    );

    return ESP_OK;    
}

esp_err_t buzzer_beep(uint32_t frequency, uint32_t duration_ms) {
    ESP_RETURN_ON_ERROR(
        buzzer_start(frequency),
        BUZZER_TAG,
        "Failed to start buzzer"
    );

    vTaskDelay(pdMS_TO_TICKS(duration_ms));

    return ESP_OK;
}
