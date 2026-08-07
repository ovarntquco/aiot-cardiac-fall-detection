#include <stdint.h>

#include "driver/i2c_types.h"
#include "driver/i2c_master.h"
#include "esp_err.h"
#include "esp_log.h"
#include "esp_timer.h"
#include "nvs_flash.h"

#include "iot_button.h"
#include "ssd1306.h"

#include "button_helper.h"
#include "buzzer.h"
#include "led.h"
#include "max30102.h"
#include "mpu6050.h"
#include "mqtt_helper.h"
#include "network_prov_helper.h"
#include "nmea_parser.h"
#include "time_sync.h"

#include "config.h"
#include "task.h"

static esp_err_t add_device(i2c_master_bus_handle_t bus_handle, i2c_master_dev_handle_t* dev_handle, uint8_t dev_addr) {
    i2c_device_config_t dev_cfg = {
        .dev_addr_length = I2C_ADDR_BIT_LEN_7,
        .device_address = dev_addr,
        .scl_speed_hz = I2C_SPEED_HZ,
    };

    return i2c_master_bus_add_device(bus_handle, &dev_cfg, dev_handle);
}

static esp_err_t i2c_master_bus_init(i2c_master_bus_handle_t* bus_handle) {
    i2c_master_bus_config_t bus_cfg = {
        .i2c_port = I2C_PORT,
        .sda_io_num = I2C_SDA_PIN,
        .scl_io_num = I2C_SCL_PIN,
        .clk_source = I2C_CLK_SRC_DEFAULT,
        .glitch_ignore_cnt = I2C_GLITCH_IGNORE,
        .flags.enable_internal_pullup = true,
    };

    return i2c_new_master_bus(&bus_cfg, bus_handle);
}

void app_main() {
    esp_err_t err;
    
    button_handle_t button = NULL;

    i2c_master_bus_handle_t bus_handle = NULL;
    i2c_master_dev_handle_t max_handle = NULL;
    i2c_master_dev_handle_t mpu_handle = NULL;
    max30102_handle_t max30102_sensor = NULL;
    mpu6050_handle_t mpu6050_sensor = NULL;

    ssd1306_config_t ssd1306_cfg = I2C_SSD1306_128x32_CONFIG_DEFAULT;
    ssd1306_handle_t ssd1306_screen = NULL;
    
    nmea_parser_config_t nmea_cfg = NMEA_PARSER_CONFIG_DEFAULT();
    nmea_parser_handle_t nmea_sensor = NULL;

    // ESP_ERROR_CHECK(nvs_flash_erase());
    
    err = nvs_flash_init();
    
    if (err == ESP_ERR_NVS_NO_FREE_PAGES || err == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        err = nvs_flash_init();
    }
    
    ESP_ERROR_CHECK(err);

    ESP_ERROR_CHECK(network_prov_init());
    ESP_ERROR_CHECK(time_sync_init());
    ESP_ERROR_CHECK(mqtt_init());

    esp_timer_create_args_t timer_args = {
        .callback = confirm_timeout_cb,
        .name = "confirm_timer"
    };
    esp_timer_handle_t confirm_timer = get_confirm_timer();
    esp_timer_create(&timer_args, &confirm_timer);
    
    err = button_init(&button, button_event_cb);
    
    if (ESP_OK != err) {
        ESP_LOGE(BUTTON_TAG, "Failed to init button");
        goto cleanup;
    }

    err = buzzer_init();

    if (ESP_OK != err) {
        ESP_LOGE(BUZZER_TAG, "Failed to init buzzer");
        goto cleanup;
    }

    err = led_init();

    if (ESP_OK != err) {
        ESP_LOGE(LED_TAG, "Failed to init led");
        goto cleanup;
    }

    ESP_ERROR_CHECK(i2c_master_bus_init(&bus_handle));
    
    err = ssd1306_init(bus_handle, &ssd1306_cfg, &ssd1306_screen);
    
    if (ESP_OK != err) {
        ESP_LOGE(OLED_TAG, "Failed to init ssd1306 handle: %s", esp_err_to_name(err));
        goto cleanup;
    }

    err = add_device(bus_handle, &max_handle, MAX30102_I2C_ADDRESS);

    if (ESP_OK != err) {
        ESP_LOGE(MAX30102_TAG, "Failed to add MAX30102: %s", esp_err_to_name(err));
        goto cleanup;
    }

    max30102_sensor = max30102_create(max_handle);

    if (max30102_sensor == NULL) {
        ESP_LOGE(MAX30102_TAG, "Failed to allocate MAX30102 handle");
        goto cleanup;
    }

    err = max30102_config(max30102_sensor,
                          REDIRONLY_MODE,
                          SAMPLEAVG_4,
                          0,
                          FIFO_A_FULL_0,
                          ADCRANGE_16384,
                          SAMPLERATE_50,
                          PULSEWIDTH_411US,
                          PULSEAMP_25_4MA);

    if (ESP_OK != err) {
        ESP_LOGE(MAX30102_TAG, "Failed to config MAX30102: %s", esp_err_to_name(err));
        goto cleanup;
    }

    err = max30102_wakeup(max30102_sensor);

    if (ESP_OK != err) {
        ESP_LOGE(MAX30102_TAG, "Failed to wake MAX30102: %s", esp_err_to_name(err));
        goto cleanup;
    }

    max30102_heartrate_algo_reset(max30102_sensor);
    max30102_spo2_algo_reset(max30102_sensor);

    err = add_device(bus_handle, &mpu_handle, MPU6050_I2C_ADDRESS);

    if (ESP_OK != err) {
        ESP_LOGE(MPU6050_TAG, "Failed to add MPU6050: %s", esp_err_to_name(err));
        goto cleanup;
    }

    mpu6050_sensor = mpu6050_create(mpu_handle);
    
    if (mpu6050_sensor == NULL) {
        ESP_LOGE(MPU6050_TAG, "Failed to allocate MPU6050 handle");
        goto cleanup;
    }

    err = mpu6050_config(mpu6050_sensor, ACCE_FS_2G, GYRO_FS_250DPS);
    
    if (ESP_OK != err) {
        ESP_LOGE(MPU6050_TAG, "Failed to config MPU6050: %s", esp_err_to_name(err));
        goto cleanup;
    }

    err = mpu6050_wakeup(mpu6050_sensor);

    if (ESP_OK != err) {
        ESP_LOGE(MPU6050_TAG, "Failed to wake MPU6050: %s", esp_err_to_name(err));
        goto cleanup;
    }

    nmea_sensor = nmea_parser_init(&nmea_cfg);

    if (nmea_sensor == NULL) {
        ESP_LOGE(NEO6MGPS_TAG, "Failed to init gps");
        goto cleanup;
    }
    
    err = nmea_parser_add_handler(nmea_sensor, gps_event_handler, NULL);
    
    if (ESP_OK != err) {
        ESP_LOGE(NEO6MGPS_TAG, "Failed to add gps handler: %s", esp_err_to_name(err));
        goto cleanup;
    }

    ESP_LOGI("SENSORS", "Sensors initialized, starting tasks");

    xTaskCreate(max30102_task, "cardiac_task", 4096, max30102_sensor, 5, NULL);
    xTaskCreate(mpu6050_task, "motion_task", 4096, mpu6050_sensor, 5, NULL);
    xTaskCreate(oled_task, "oled_display_task", 4096, ssd1306_screen, 5, NULL);

    return;
    
cleanup:
    if (mpu6050_sensor) {
        mpu6050_delete(mpu6050_sensor);
        mpu6050_sensor = NULL;
    }

    if (mpu_handle) {
        i2c_master_bus_rm_device(mpu_handle);
        mpu_handle = NULL;
    }

    if (max30102_sensor) {
        max30102_delete(max30102_sensor);
        max30102_sensor = NULL;
    }

    if (max_handle) {
        i2c_master_bus_rm_device(max_handle);
        max_handle = NULL;
    }

    if (ssd1306_screen) {
        ssd1306_remove(ssd1306_screen);
        ssd1306_screen = NULL;
    }

    if (bus_handle) {
        i2c_del_master_bus(bus_handle);
        bus_handle = NULL;
    }

    if (nmea_sensor) {
        nmea_parser_deinit(nmea_sensor);
        nmea_sensor = NULL;
    }

    if (button) {
        iot_button_delete(button);
        button = NULL;
    }

    if (confirm_timer) {
        esp_timer_delete(confirm_timer);
    }
}
