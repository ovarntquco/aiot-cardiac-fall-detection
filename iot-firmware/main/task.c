#include "esp_log.h"
#include "esp_timer.h"

#include "mqtt_helper.h"
#include "json_helper.h"

#include "max30102.h"
#include "max30102_payload.h"

#include "mpu6050.h"
#include "mpu6050_payload.h"

#include "ssd1306.h"

#include "nmea_parser.h"

#include "config.h"

void max30102_task(void* pvParameters) {
    max30102_handle_t sensor = pvParameters;

    uint8_t rates[CARDIAC_RATE_AVG_SIZE] = {0};
    uint8_t rate_spot = 0;
    int64_t last_beat_us = 0;
    float beats_per_minute = 0;
    int beat_avg = 0;
    
    static uint32_t ir_buffer[CARDIAC_BUFFER_SIZE];
    static uint32_t red_buffer[CARDIAC_BUFFER_SIZE];
    
    int spo2_buf_idx = 0;
    int decim_counter = 0;
    
    int32_t spo2 = -999, spo2_hr = -999;
    int8_t spo2_valid = 0, spo2_hr_valid = 0;

    uint32_t red, ir;

    max30102_payload_t p;
    max30102_payload_start(&p);

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
                    rate_spot %= CARDIAC_RATE_AVG_SIZE;

                    int sum = 0;
                    for (int i = 0; i < CARDIAC_RATE_AVG_SIZE; i++)
                        sum += rates[i];
                    beat_avg = sum / CARDIAC_RATE_AVG_SIZE;
                }
            }

            last_beat_us = now_us;
        }

        if (ir >= CARDIAC_FINGER_THRESHOLD) {
            ++decim_counter;

            if (decim_counter >= CARDIAC_SPO2_DECIMATION) {
                decim_counter = 0;
                
                ir_buffer[spo2_buf_idx] = ir;
                red_buffer[spo2_buf_idx] = red;

                ++spo2_buf_idx;

                if (spo2_buf_idx >= CARDIAC_BUFFER_SIZE) {
                    max30102_heartrate_and_spo2(sensor,
                                                ir_buffer,
                                                CARDIAC_BUFFER_SIZE,
                                                red_buffer,
                                                &spo2,
                                                &spo2_valid,
                                                &spo2_hr,
                                                &spo2_hr_valid);
                    spo2_buf_idx = 0;
                }
            }

            ESP_LOGI(MAX30102_TAG, "IR=%lu BPM=%.1f AvgBPM=%d | SpO2=%ld%% (valid=%d) BatchHR=%ld (valid=%d)",
                      (unsigned long)ir, beats_per_minute, beat_avg,
                      (long)spo2, spo2_valid, (long)spo2_hr, spo2_hr_valid);

            max30102_set_beat_avg(beat_avg);
            max30102_set_spo2(spo2);
            max30102_payload_add_sample(&p, beat_avg, (int) spo2);

            bool should_publish = mqtt_is_connected() && 
                                  p.heart_rate > 0 &&
                                  p.spo2 > -999 && 
                                  p.sample_count >= CARDIAC_PUBLISH_EVERY_N_SAMPLES; 

            if (should_publish) {
                char* payload = json_convert_cardiac(&p);
                mqtt_publish_topic(payload, MAX30102_TAG, MQTT_TOPIC_CARDIAC);
                max30102_payload_start(&p);
            }
        } else {
            ESP_LOGD(MAX30102_TAG, "No finger detected");
            max30102_heartrate_algo_reset(sensor);
            max30102_set_beat_avg(0);
            max30102_set_spo2(-999);
            last_beat_us = 0;
            spo2_buf_idx = 0;
            decim_counter = 0;
        }
        
        vTaskDelay(pdMS_TO_TICKS(1000 / CARDIAC_SAMPLE_RATE_HZ));
    }
}

void mpu6050_task(void* pvParameters) {
    mpu6050_handle_t sensor = pvParameters;

    mpu6050_acce_value_t acce_value;
    mpu6050_gyro_value_t gyro_value;
    mpu6050_payload_t p;
    mpu6050_payload_start(&p);

    while (1) {
        esp_err_t acce_err = mpu6050_get_acce(sensor, &acce_value);
        esp_err_t gyro_err = mpu6050_get_gyro(sensor, &gyro_value);

        if (ESP_OK != acce_err) {
            ESP_LOGE(MPU6050_TAG, "Failed to read accel: %s", esp_err_to_name(acce_err));
        }

        if (ESP_OK != gyro_err) {
            ESP_LOGE(MPU6050_TAG, "Failed to read gyro: %s", esp_err_to_name(gyro_err));
        }

        if (ESP_OK == acce_err && ESP_OK == gyro_err) {
            ESP_LOGI(MPU6050_TAG, "acce_x=%.3f acce_y=%.3f acce_z=%.3f | gyro_x=%.3f gyro_y=%.3f gyro_z=%.3f",
                     acce_value.acce_x, acce_value.acce_y, acce_value.acce_z,
                     gyro_value.gyro_x, gyro_value.gyro_y, gyro_value.gyro_z);

            mpu6050_payload_add_sample(&p, 
                                    acce_value.acce_x, acce_value.acce_y, acce_value.acce_z,
                                    gyro_value.gyro_x, gyro_value.gyro_y, gyro_value.gyro_z);
            
            bool should_publish = mqtt_is_connected() && 
                                  p.sample_count >= MOTION_PUBLISH_EVERY_N_SAMPLES;

            if (should_publish) {
                char* payload = json_convert_motion(&p);
                mqtt_publish_topic(payload, MPU6050_TAG, MQTT_TOPIC_MOTION);
                mpu6050_payload_start(&p);
            }
        }

        vTaskDelay(pdMS_TO_TICKS(1000 / MOTION_SAMPLE_RATE_HZ));
    }
}

void oled_task(void* pv_parameters) {
    ssd1306_handle_t oled_screen = pv_parameters;

    char line1[16];
    char line2[16];
    int last_bpm = -1;
    int last_spo2 = -1;

    while (1) {
        int current_bpm = max30102_get_beat_avg();
        int current_spo2 = (int) max30102_get_spo2();

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

void gps_event_handler(void *event_handler_arg, esp_event_base_t event_base, int32_t event_id, void *event_data) {
    gps_t *gps = NULL;
    neo6mgps_payload_t p;
    neo6mgps_payload_start(&p);

    switch (event_id) {
        case GPS_UPDATE:
            gps = (gps_t *)event_data;

            ESP_LOGI(NEO6MGPS_TAG, "latitude = %.05f°N | longitude  = %.05f°E | altitude = %.02fm | speed = %fm/s",
                     gps->latitude, gps->longitude, gps->altitude, gps->speed);
            
            neo6mgps_payload_add_sample(&p, gps->latitude, gps->longitude);

            bool should_publish = mqtt_is_connected() &&
                                  p.latitude != 0 &&
                                  p.longitude != 0 &&
                                  p.sample_count >= GPS_SAMPLE_RATE_HZ;

            if (should_publish) {
                char* payload = json_convert_gps(&p);
                mqtt_publish_topic(payload, NEO6MGPS_TAG, MQTT_TOPIC_GPS);
                neo6mgps_payload_start(&p);
            }
            break;
        case GPS_UNKNOWN:
            ESP_LOGW(NEO6MGPS_TAG, "Unknown statement:%s", (char *)event_data);
            break;
        default:
            break;
    }
}
