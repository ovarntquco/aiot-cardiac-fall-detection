#include "driver/ledc.h"
#include "esp_log.h"
#include "freertos/FreeRTOS.h"

#include "led.h"

#define LED_CLK_CFG         LEDC_AUTO_CLK
#define LED_DUTY            (4096)
#define LED_DUTY_RESOLUTION LEDC_TIMER_13_BIT
#define LED_FREQ_HZ         (4000)
#define LED_GPIO_NUM        (1)
#define LED_LEDC_CHANNEL    LEDC_CHANNEL_1
#define LED_SPEED_MODE      LEDC_LOW_SPEED_MODE
#define LED_TIMER_NUM       LEDC_TIMER_0

esp_err_t led_init(void) {
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
    
    esp_err_t ret = ledc_timer_config(&ledc_timer);
    if (ret != ESP_OK) {
        ESP_LOGE(LED_TAG, "Failed to config led's ledc timer: %s", esp_err_to_name(ret));
    }

    ret = ledc_channel_config(&ledc_channel);
    if (ret != ESP_OK) {
        ESP_LOGE(LED_TAG, "Failed to config led's ledc channel: %s", esp_err_to_name(ret));
    }
    return ESP_OK;
}

void led_deinit(void) {
    esp_err_t ret = ledc_stop(LED_SPEED_MODE, LED_LEDC_CHANNEL, 0);
    if (ret != ESP_OK) {
        ESP_LOGE(LED_TAG, "Failed to stop ledc during deinit: %s", esp_err_to_name(ret));
    }
}

esp_err_t led_start(void) {
    esp_err_t ret = ledc_set_duty(LED_SPEED_MODE, LED_LEDC_CHANNEL, LED_DUTY);
    if (ret != ESP_OK) {
        ESP_LOGE(LED_TAG, "Failed to set led's duty cycle to start led: %s", esp_err_to_name(ret));
    }

    ret = ledc_update_duty(LED_SPEED_MODE, LED_LEDC_CHANNEL);
    if (ret != ESP_OK) {
        ESP_LOGE(LED_TAG, "Failed to update duty cycle to start led: %s", esp_err_to_name(ret));
    }
    return ESP_OK;
}

esp_err_t led_stop(void) {
    esp_err_t ret = ledc_set_duty(LED_SPEED_MODE, LED_LEDC_CHANNEL, 0);
    if (ret != ESP_OK) {
        ESP_LOGE(LED_TAG, "Failed to set led's duty cycle to stop led: %s", esp_err_to_name(ret));
    }

    ret = ledc_update_duty(LED_SPEED_MODE, LED_LEDC_CHANNEL);
    if (ret != ESP_OK) {
        ESP_LOGE(LED_TAG, "Failed to update duty cycle to stop led: %s", esp_err_to_name(ret));
    }
    
    ret = ledc_stop(LED_SPEED_MODE, LED_LEDC_CHANNEL, 0);
    if (ret != ESP_OK) {
        ESP_LOGE(LED_TAG, "Failed to stop ledc to stop led: %s", esp_err_to_name(ret));
    }
    return ESP_OK;    
}

esp_err_t led_blink(uint32_t on_ms, uint32_t off_ms, int repeat) {
    esp_err_t ret;
    for (int i = 0; i < repeat; ++i) {
        ret = led_start();
        if (ret != ESP_OK) {
            ESP_LOGE(LED_TAG, "Failed to start led: %s", esp_err_to_name(ret));
        }

        vTaskDelay(pdMS_TO_TICKS(on_ms));
        
        ret = led_stop();
        if (ret != ESP_OK) {
            ESP_LOGE(LED_TAG, "Failed to stop led: %s", esp_err_to_name(ret));
        }

        vTaskDelay(pdMS_TO_TICKS(off_ms));
    }
    return ESP_OK;
}
