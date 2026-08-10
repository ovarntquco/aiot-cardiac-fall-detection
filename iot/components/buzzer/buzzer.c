#include "driver/ledc.h"
#include "esp_log.h"

#include "buzzer.h"

#define BUZZER_CLK_CFG          LEDC_AUTO_CLK
#define BUZZER_DUTY             (4096)
#define BUZZER_DUTY_RESOLUTION  LEDC_TIMER_13_BIT
#define BUZZER_FREQ_HZ          (4000)
#define BUZZER_GPIO_NUM         (21)
#define BUZZER_LEDC_CHANNEL     LEDC_CHANNEL_0
#define BUZZER_SPEED_MODE       LEDC_LOW_SPEED_MODE
#define BUZZER_TIMER_NUM        LEDC_TIMER_0

esp_err_t buzzer_init(void) {
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

    esp_err_t ret = ledc_timer_config(&ledc_timer);
    if (ret != ESP_OK) {
        ESP_LOGE(BUZZER_TAG, "Failed to config buzzer's ledc timer: %s", esp_err_to_name(ret));
        return ret;
    }

    ret = ledc_channel_config(&ledc_channel);
    if (ret != ESP_OK) {
        ESP_LOGE(BUZZER_TAG, "Failed to config buzzer's ledc channel: %s", esp_err_to_name(ret));
        return ret;
    }
    return ESP_OK;
}

void buzzer_deinit(void) {
    esp_err_t ret = ledc_stop(BUZZER_SPEED_MODE, BUZZER_LEDC_CHANNEL, 0);
    if (ret != ESP_OK) {
        ESP_LOGE(BUZZER_TAG, "Failed to stop ledc during buzzer deinit: %s", esp_err_to_name(ret));
    }
}

esp_err_t buzzer_start(uint32_t frequency) {
    esp_err_t ret = ledc_set_duty(BUZZER_SPEED_MODE, BUZZER_LEDC_CHANNEL, BUZZER_DUTY);
    if (ret != ESP_OK) {
        ESP_LOGE(BUZZER_TAG, "Failed to set buzzer's duty cycle to start buzzer: %s", esp_err_to_name(ret));
    }

    ret = ledc_update_duty(BUZZER_SPEED_MODE, BUZZER_LEDC_CHANNEL);
    if (ret != ESP_OK) {
        ESP_LOGE(BUZZER_TAG, "Failed to update duty cycle to start buzzer: %s", esp_err_to_name(ret));
    }

    ret = ledc_set_freq(BUZZER_SPEED_MODE, BUZZER_TIMER_NUM, frequency);
    if (ret != ESP_OK) {
        ESP_LOGE(BUZZER_TAG, "Failed to set frequency to start buzzer: %s", esp_err_to_name(ret));
    }
    return ESP_OK;
}

esp_err_t buzzer_stop(void) {
    esp_err_t ret = ledc_set_duty(BUZZER_SPEED_MODE, BUZZER_LEDC_CHANNEL, 0);
    if (ret != ESP_OK) {
        ESP_LOGE(BUZZER_TAG, "Failed to set buzzer's duty cycle to stop buzzer: %s", esp_err_to_name(ret));
    }

    ret = ledc_update_duty(BUZZER_SPEED_MODE, BUZZER_LEDC_CHANNEL);
    if (ret != ESP_OK) {
        ESP_LOGE(BUZZER_TAG, "Failed to update duty cycle to stop buzzer: %s", esp_err_to_name(ret));
    }
    
    ret = ledc_stop(BUZZER_SPEED_MODE, BUZZER_LEDC_CHANNEL, 0);
    if (ret != ESP_OK) {
        ESP_LOGE(BUZZER_TAG, "Failed to stop ledc to stop buzzer: %s", esp_err_to_name(ret));
    }
    return ESP_OK;    
}

esp_err_t buzzer_beep(uint32_t frequency) {
    esp_err_t ret = buzzer_start(frequency);
    if (ret != ESP_OK) {
        ESP_LOGE(BUZZER_TAG, "Failed to start buzzer: %s", esp_err_to_name(ret));
    }
    return ESP_OK;
}
