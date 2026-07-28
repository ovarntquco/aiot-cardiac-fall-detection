#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

#include "driver/i2c_types.h"
#include "driver/i2c_master.h"

#include "esp_err.h"
#include "esp_log.h"
#include "esp_timer.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/projdefs.h"

#include "cJSON.h"
#include "nvs_flash.h"

#include "ssd1306.h"

#include "mpu6050.h"
#include "max30102.h"
#include "nmea_parser.h"
#include "mqtt_helper.h"
#include "network_prov_helper.h"

#include "pipeline.h"

#define I2C_PORT            I2C_NUM_0
#define I2C_SDA_PIN         GPIO_NUM_5
#define I2C_SCL_PIN         GPIO_NUM_4
#define I2C_SPEED_HZ        400000
#define I2C_GLITCH_IGNORE   7

#define MQTT_TOPIC_VITALS   "sensor/vitals"
#define MQTT_TOPIC_MOTION   "sensor/motion"
#define MQTT_TOPIC_GPS      "sensor/gps"
#define DEVICE_ID           "wearable-01"

#define MOTION_PUBLISH_EVERY_N_SAMPLES (SAMPLE_RATE_HZ > 0 ? SAMPLE_RATE_HZ : 1)

static const char* OLED_TAG = "SSD1306";
static const char* MPU6050_TAG = "MPU6050";
static const char* MAX30102_TAG = "MAX30102";
static const char* NEO6MGPS_TAG = "NEO6MGPS";

static int s_beat_avg = 0;
static int32_t s_spo2 = -999;
static volatile bool mqtt_connected = false;
static esp_mqtt_client_handle_t mqtt_client;

static void gps_event_handler(void *event_handler_arg, esp_event_base_t event_base, int32_t event_id, void *event_data) {
    gps_t *gps = NULL;
    switch (event_id) {
        case GPS_UPDATE:
            gps = (gps_t *)event_data;
            /* print information parsed from GPS statements */
            ESP_LOGI("NEO6MGPS", "%d/%d/%d %d:%d:%d => \r\n"
                    "\t\t\t\t\t\tlatitude   = %.05f°N\r\n"
                    "\t\t\t\t\t\tlongitude  = %.05f°E\r\n"
                    "\t\t\t\t\t\taltitude   = %.02fm\r\n"
                    "\t\t\t\t\t\tspeed      = %fm/s",
                    gps->date.year + YEAR_BASE, gps->date.month, gps->date.day,
                    gps->tim.hour + TIME_ZONE, gps->tim.minute, gps->tim.second,
                    gps->latitude, gps->longitude, gps->altitude, gps->speed);
            
            if (mqtt_connected && gps->latitude != 0 && gps->longitude != 0) {
                char time[30];
                snprintf(time, sizeof(time), "%d/%d/%d %d:%d:%d",
                        gps->date.year + YEAR_BASE, gps->date.month, gps->date.day,
                        gps->tim.hour + TIME_ZONE, gps->tim.minute, gps->tim.second);
                cJSON *root = cJSON_CreateObject();
                cJSON_AddStringToObject(root, "device_id", DEVICE_ID);
                cJSON_AddStringToObject(root, "time", time);
                cJSON_AddNumberToObject(root, "latitude", gps->latitude);
                cJSON_AddNumberToObject(root, "longitude", gps->longitude);

                char* payload = cJSON_PrintUnformatted(root);
                int msg_id = esp_mqtt_client_publish(mqtt_client, MQTT_TOPIC_GPS, payload, 0, 2, 0);
                if (msg_id < 0)
                    ESP_LOGW(NEO6MGPS_TAG, "GPS publish failed");

                cJSON_Delete(root);
                free(payload);
            }
            break;
        case GPS_UNKNOWN:
            /* print unknown statements */
            ESP_LOGW("NEO6MGPS", "Unknown statement:%s", (char *)event_data);
            break;
        default:
            break;
    }
}

static void max30102_task(void *pv_parameters) {
    max30102_handle_t sensor = pv_parameters;

    uint8_t rates[RATE_AVG_SIZE] = {0};
    uint8_t rate_spot = 0;
    int64_t last_beat_us = 0;
    float beats_per_minute = 0;
    int beat_avg = 0;
    
    static uint32_t ir_buffer[BUFFER_SIZE];
    static uint32_t red_buffer[BUFFER_SIZE];
    
    int spo2_buf_idx = 0;
    int decim_counter = 0;
    
    int32_t spo2 = -999, spo2_hr = -999;
    int8_t spo2_valid = 0, spo2_hr_valid = 0;

    uint32_t red, ir;

    while (1) {
        esp_err_t err = max30102_read_fifo(sensor, &red, &ir);
        if (ESP_OK != err) {
            ESP_LOGE(MAX30102_TAG, "FIFO read failed: %s", esp_err_to_name(err));
            vTaskDelay(pdMS_TO_TICKS(100));
            continue;
        }

        if (max30102_heartrate_check_for_beat(sensor, (int32_t)ir)) {
            int64_t now_us = esp_timer_get_time();

            if (last_beat_us != 0) {
                int64_t delta_us = now_us - last_beat_us;
                beats_per_minute = 60.0f / (delta_us / 1000000.0f);

                if (beats_per_minute > 20 && beats_per_minute < 220) {
                    rates[rate_spot++] = (uint8_t)beats_per_minute;
                    rate_spot %= RATE_AVG_SIZE;

                    int sum = 0;
                    for (int i = 0; i < RATE_AVG_SIZE; i++)
                        sum += rates[i];
                    beat_avg = sum / RATE_AVG_SIZE;
                }
            }

            last_beat_us = now_us;
        }

        if (ir >= FINGER_THRESHOLD) {
            ++decim_counter;

            if (decim_counter >= SPO2_DECIMATION) {
                decim_counter = 0;
                
                ir_buffer[spo2_buf_idx] = ir;
                red_buffer[spo2_buf_idx] = red;

                ++spo2_buf_idx;

                if (spo2_buf_idx >= BUFFER_SIZE) {
                    max30102_heartrate_and_spo2(
                        sensor,
                        ir_buffer,
                        BUFFER_SIZE,
                        red_buffer,
                        &spo2,
                        &spo2_valid,
                        &spo2_hr,
                        &spo2_hr_valid
                    );
                    spo2_buf_idx = 0;
                }
            }

            ESP_LOGI(MAX30102_TAG, "IR=%lu BPM=%.1f AvgBPM=%d | SpO2=%ld%% (valid=%d) BatchHR=%ld (valid=%d)",
                      (unsigned long)ir, beats_per_minute, beat_avg,
                      (long)spo2, spo2_valid, (long)spo2_hr, spo2_hr_valid);

            s_beat_avg = beat_avg;
            s_spo2 = spo2;

            if (mqtt_connected && s_beat_avg > 0 && s_spo2 > -999) {
                cJSON *root = cJSON_CreateObject();
                cJSON_AddStringToObject(root, "device_id", DEVICE_ID);
                cJSON_AddNumberToObject(root, "bpm", beats_per_minute);
                cJSON_AddNumberToObject(root, "bpm_avg", beat_avg);
                cJSON_AddNumberToObject(root, "spo2", spo2);

                char* payload = cJSON_PrintUnformatted(root);
                int msg_id = esp_mqtt_client_publish(mqtt_client, MQTT_TOPIC_VITALS, payload, 0, 2, 0);
                if (msg_id < 0)
                    ESP_LOGW(MAX30102_TAG, "Vitals publish failed");

                cJSON_Delete(root);
                free(payload);
            }
        } else {
            ESP_LOGD(MAX30102_TAG, "No finger detected");
            max30102_heartrate_algo_reset(sensor);
            last_beat_us = 0;
            spo2_buf_idx = 0;
            decim_counter = 0;
            s_beat_avg = 0;
            s_spo2 = -999;
        }
        
        vTaskDelay(pdMS_TO_TICKS(1000 / SAMPLE_RATE_HZ));
    }
}

static void mpu6050_task(void *pv_parameters) {
    mpu6050_handle_t sensor = pv_parameters;

    mpu6050_acce_value_t acce_value;
    mpu6050_gyro_value_t gyro_value;
    int decim_counter = 0;

    while (1) {
        esp_err_t acce_err = mpu6050_get_acce(sensor, &acce_value);
        esp_err_t gyro_err = mpu6050_get_gyro(sensor, &gyro_value);

        if (acce_err != ESP_OK)
            ESP_LOGE(MPU6050_TAG, "Failed to read accel: %s", esp_err_to_name(acce_err));

        if (gyro_err != ESP_OK)
            ESP_LOGE(MPU6050_TAG, "Failed to read gyro: %s", esp_err_to_name(gyro_err));

        if (acce_err == ESP_OK && gyro_err == ESP_OK) {
            ESP_LOGI(MPU6050_TAG,"acce_x=%.3f acce_y=%.3f acce_z=%.3f | gyro_x=%.3f gyro_y=%.3f gyro_z=%.3f",
                     acce_value.acce_x, acce_value.acce_y, acce_value.acce_z,
                     gyro_value.gyro_x, gyro_value.gyro_y, gyro_value.gyro_z);

            decim_counter++;
            if (mqtt_connected && decim_counter >= MOTION_PUBLISH_EVERY_N_SAMPLES) {
                decim_counter = 0;

                cJSON *root = cJSON_CreateObject();
                cJSON_AddStringToObject(root, "device_id", DEVICE_ID);
                cJSON_AddNumberToObject(root, "acce_x", acce_value.acce_x);
                cJSON_AddNumberToObject(root, "acce_y", acce_value.acce_y);
                cJSON_AddNumberToObject(root, "acce_z", acce_value.acce_z);
                cJSON_AddNumberToObject(root, "gyro_x", gyro_value.gyro_x);
                cJSON_AddNumberToObject(root, "gyro_y", gyro_value.gyro_y);
                cJSON_AddNumberToObject(root, "gyro_z", gyro_value.gyro_z);

                char *payload = cJSON_PrintUnformatted(root);
                int msg_id = esp_mqtt_client_publish(mqtt_client, MQTT_TOPIC_MOTION, payload, 0, 1, 0);
                if (msg_id < 0) {
                    ESP_LOGW(MPU6050_TAG, "Motion publish failed");
                }

                cJSON_Delete(root);
                free(payload);
            }
        }

        vTaskDelay(pdMS_TO_TICKS(1000 / SAMPLE_RATE_HZ));
    }
}

static void oled_task(void* pv_parameters) {
    ssd1306_handle_t oled_screen = pv_parameters;

    char line1[16];
    char line2[16];
    int last_bpm = -1;
    int last_spo2 = -1;

    while (1) {
        int current_bpm = s_beat_avg;
        int current_spo2 = (int)s_spo2;

        if (current_bpm != last_bpm || current_spo2 != last_spo2) {
            snprintf(line1, sizeof(line1), "BPM: %d", current_bpm);
            snprintf(line2, sizeof(line2), "SpO2: %d%%", current_spo2);

            ssd1306_clear_display(oled_screen, false);
            ssd1306_display_text(oled_screen, 0, line1, false);
            ssd1306_display_text(oled_screen, 2, line2, false);

            last_bpm = current_bpm;
            last_spo2 = current_spo2;
        }

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}

// ---------- I2C helper ----------

static esp_err_t add_device(i2c_master_bus_handle_t bus_handle, i2c_master_dev_handle_t *dev_handle, uint8_t dev_addr) {
    i2c_device_config_t dev_cfg = {
        .dev_addr_length = I2C_ADDR_BIT_LEN_7,
        .device_address = dev_addr,
        .scl_speed_hz = I2C_SPEED_HZ,
    };

    return i2c_master_bus_add_device(bus_handle, &dev_cfg, dev_handle);
}

void pipeline() {
    ESP_ERROR_CHECK(nvs_flash_erase());

    esp_err_t err = nvs_flash_init();
    
    if (err == ESP_ERR_NVS_NO_FREE_PAGES || err == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        err = nvs_flash_init();
    }
    ESP_ERROR_CHECK(err);

    network_prov_provision();

    err = mqtt_init(&mqtt_client);
    if (err != ESP_OK) {
        ESP_LOGE(MQTT_TAG, "Failed to init MQTT: %s", esp_err_to_name(err));
        return;
    }
    mqtt_connected = true;

    // ----- I2C bus -----
    i2c_master_bus_handle_t bus_handle;
    i2c_master_bus_config_t bus_cfg = {
        .i2c_port = I2C_PORT,
        .sda_io_num = I2C_SDA_PIN,
        .scl_io_num = I2C_SCL_PIN,
        .clk_source = I2C_CLK_SRC_DEFAULT,
        .glitch_ignore_cnt = I2C_GLITCH_IGNORE,
        .flags.enable_internal_pullup = true,
    };

    esp_err_t ret = i2c_new_master_bus(&bus_cfg, &bus_handle);
    if (ret != ESP_OK) {
        ESP_LOGE("BUS_TAG", "Failed to create I2C bus: %s", esp_err_to_name(ret));
        return;
    }

    // ----- NEO6MGPS -----
    nmea_parser_config_t config = NMEA_PARSER_CONFIG_DEFAULT();
    /* init NMEA parser library */
    nmea_parser_handle_t nmea_hdl = nmea_parser_init(&config);
    /* register event handler for NMEA parser library */
    nmea_parser_add_handler(nmea_hdl, gps_event_handler, NULL);

    // ----- SSD1306 (OLED) -----
    ssd1306_config_t oled_cfg = I2C_SSD1306_128x32_CONFIG_DEFAULT;
    ssd1306_handle_t oled_screen;
    ssd1306_init(bus_handle, &oled_cfg, &oled_screen);
    if (oled_screen == NULL) {
        ESP_LOGE(OLED_TAG, "ssd1306 handle init failed");
        return;
    }

    // ----- MAX30102 -----
    i2c_master_dev_handle_t max_handle;
    ret = add_device(bus_handle, &max_handle, MAX30102_I2C_ADDRESS);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to add MAX30102: %s", esp_err_to_name(ret));
        i2c_del_master_bus(bus_handle);
        return;
    }

    max30102_handle_t max30102_sensor = max30102_create(max_handle);
    if (max30102_sensor == NULL) {
        ESP_LOGE(MAX30102_TAG, "Failed to allocate MAX30102 handle");
        i2c_master_bus_rm_device(max_handle);
        i2c_del_master_bus(bus_handle);
        return;
    }

    ret = max30102_config(
        max30102_sensor,
        REDIRONLY_MODE,
        SAMPLEAVG_4,
        0,
        FIFO_A_FULL_0,
        ADCRANGE_16384,
        SAMPLERATE_50,
        PULSEWIDTH_411US,
        PULSEAMP_25_4MA
    );
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to config MAX30102: %s", esp_err_to_name(ret));
        max30102_delete(max30102_sensor);
        i2c_master_bus_rm_device(max_handle);
        i2c_del_master_bus(bus_handle);
        return;
    }

    // ----- MPU6050 -----
    i2c_master_dev_handle_t mpu_handle;
    ret = add_device(bus_handle, &mpu_handle, MPU6050_I2C_ADDRESS);
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to add MPU6050: %s", esp_err_to_name(ret));
        max30102_delete(max30102_sensor);
        i2c_master_bus_rm_device(max_handle);
        i2c_del_master_bus(bus_handle);
        return;
    }

    mpu6050_handle_t mpu6050_sensor = mpu6050_create(mpu_handle);
    if (mpu6050_sensor == NULL) {
        ESP_LOGE(MPU6050_TAG, "Failed to allocate MPU6050 handle");
        max30102_delete(max30102_sensor);
        i2c_master_bus_rm_device(mpu_handle);
        i2c_master_bus_rm_device(max_handle);
        i2c_del_master_bus(bus_handle);
        return;
    }

    ret = mpu6050_config(mpu6050_sensor, ACCE_FS_2G, GYRO_FS_250DPS);
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to config MPU6050: %s", esp_err_to_name(ret));
        mpu6050_delete(mpu6050_sensor);
        max30102_delete(max30102_sensor);
        i2c_master_bus_rm_device(mpu_handle);
        i2c_master_bus_rm_device(max_handle);
        i2c_del_master_bus(bus_handle);
        return;
    }

    // ----- Wake sensors (all previously-ignored return values now checked) -----
    ret = max30102_wakeup(max30102_sensor);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to wake MAX30102: %s", esp_err_to_name(ret));
        return;
    }

    max30102_heartrate_algo_reset(max30102_sensor);
    max30102_spo2_algo_reset(max30102_sensor);

    ret = mpu6050_wakeup(mpu6050_sensor);
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to wake MPU6050: %s", esp_err_to_name(ret));
        return;
    }

    ESP_LOGI("SENSORS", "Sensors initialized, starting tasks");

    xTaskCreate(max30102_task, "heart_rate_task", 4096, max30102_sensor, 5, NULL);
    xTaskCreate(mpu6050_task, "movement_task", 4096, mpu6050_sensor, 5, NULL);
    xTaskCreate(oled_task, "oled_display_task", 4096, oled_screen, 5, NULL);
}