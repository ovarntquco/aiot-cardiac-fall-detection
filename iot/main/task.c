#include <stdlib.h>

#include "esp_err.h"
#include "esp_log.h"
#include "esp_timer.h"

#include "iot_button.h"
#include "ssd1306.h"

#include "ai_service.h"
#include "button.h"
#include "buzzer.h"
#include "event_payload.h"
#include "json_helper.h"
#include "led.h"
#include "max30102.h"
#include "max30102_payload.h"
#include "model_metadata.h"
#include "mpu6050.h"
#include "mpu6050_payload.h"
#include "mqtt_helper.h"
#include "nmea_parser.h"

#include "config.h"

#define ALERT_TAG "ALERT"

static bool waiting_confirm = false;
static esp_timer_handle_t confirm_timer;
static event_payload_t pending_event;

static esp_err_t local_alert() {
    esp_err_t ret = buzzer_beep(2000);
    if (ret != ESP_OK) {
        ESP_LOGE(BUZZER_TAG, "Failed to beep: %s", esp_err_to_name(ret));
        return ret;
    }

    ret = led_blink(200, 200, 10);
    if (ret != ESP_OK) {
        ESP_LOGE(LED_TAG, "Failed to blink: %s", esp_err_to_name(ret));
        return ret;
    }
    return ESP_OK;
}

static esp_err_t stop_alert() {
    esp_err_t ret = buzzer_stop();
    if (ret != ESP_OK) {
        ESP_LOGE(BUZZER_TAG, "Failed to stop buzzer: %s", esp_err_to_name(ret));
        return ret;
    }

    ret = led_stop();
    if (ret != ESP_OK) {
        ESP_LOGE(LED_TAG, "Failed to stop led: %s", esp_err_to_name(ret));
        return ret;
    }
    return ESP_OK;
}

void max30102_task(void* pvParameters) {
    max30102_handle_t sensor = pvParameters;
        
    max30102_event_flags_t ev;
    max30102_monitor_t monitor;
    max30102_monitor_reset(&monitor);

    max30102_payload_t p;
    max30102_payload_start(&p);

    static uint32_t ir_buffer[CARDIAC_BUFFER_SIZE];
    static uint32_t red_buffer[CARDIAC_BUFFER_SIZE];
    
    uint8_t rates[CARDIAC_RATE_AVG_SIZE] = {0};
    uint8_t rate_spot = 0, beat_detected = 0;
    int8_t spo2_valid = 0, spo2_hr_valid = 0;
    uint32_t red, ir;
    int32_t spo2 = -999, spo2_hr = -999;
    int beat_avg = 0, decim_counter = 0, spo2_buf_idx = 0;
    int64_t last_beat_us = 0;

    float beats_per_minute = 0;

    while (1) {
        esp_err_t ret = max30102_read_fifo(sensor, &red, &ir);
        if (ret != ESP_OK) {
            ESP_LOGE(MAX30102_TAG, "Failed to read FIFO: %s", esp_err_to_name(ret));
            vTaskDelay(pdMS_TO_TICKS(100));
            continue;
        }

        max30102_heartrate_check_for_beat(sensor, (int32_t)ir, &beat_detected);
        if (beat_detected) {
            int64_t now_us = esp_timer_get_time();

            if (last_beat_us != 0) {
                int64_t delta_us = now_us - last_beat_us;
                beats_per_minute = 60.0f / (delta_us / 1000000.0f);

                if (beats_per_minute > 20 && beats_per_minute < 220) {
                    rates[rate_spot++] = (uint8_t)beats_per_minute;
                    rate_spot %= CARDIAC_RATE_AVG_SIZE;

                    int sum = 0;
                    for (int i = 0; i < CARDIAC_RATE_AVG_SIZE; ++i) {
                        sum += rates[i];
                    }
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

            // ESP_LOGI(MAX30102_TAG, "IR=%lu BPM=%.1f AvgBPM=%d | SpO2=%ld%% (valid=%d) BatchHR=%ld (valid=%d)",
            //         (unsigned long)ir, beats_per_minute, beat_avg,
            //         (long)spo2, spo2_valid, (long)spo2_hr, spo2_hr_valid);
            
            max30102_set_stats_for_display(beat_avg, spo2);
            max30102_payload_add_sample(&p, beat_avg, (int) spo2);

            bool should_publish = mqtt_is_connected() &&
                                  (esp_timer_get_time() - monitor.warmup_start_us) / 1000 > CARDIAC_SENSOR_WARMUP_MS &&
                                  p.heart_rate > 0 &&
                                  p.spo2 > -999 && 
                                  p.sample_count >= CARDIAC_PUBLISH_EVERY_N_SAMPLES; 

            if (should_publish) {
                char* payload = json_convert_cardiac(&p);
                mqtt_publish_topic(payload, MAX30102_TAG, MQTT_TOPIC_CARDIAC);
                free(payload);
                max30102_payload_start(&p);
            }

            max30102_process_cardiac_sample(beat_avg, spo2, &monitor, &ev);
            if (ev != CARDIAC_EVENT_NONE && !waiting_confirm) {
                max30102_monitor_reset(&monitor);
                
                waiting_confirm = true;
                
                esp_timer_start_once(confirm_timer, ALERT_CONFIRM_TIMEOUT_MS);
                
                ret = local_alert();
                if (ret != ESP_OK) {
                    ESP_LOGE(ALERT_TAG, "Failed to trigger local alert");
                }
            }
        } else {
            ESP_LOGD(MAX30102_TAG, "No finger detected");
            max30102_heartrate_algo_reset(sensor);
            max30102_set_stats_for_display(0, -999);
            max30102_monitor_reset(&monitor);
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
    mpu6050_mqtt_payload_t mqtt_p;
    mpu6050_infer_payload_t infer_p;
    mpu6050_mqtt_payload_start(&mqtt_p);
    mpu6050_infer_payload_start(&infer_p);

    esp_err_t acce_err, gyro_err, ret;
    
    while (1) {
        acce_err = mpu6050_get_acce(sensor, &acce_value);
        gyro_err = mpu6050_get_gyro(sensor, &gyro_value);

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

            mpu6050_mqtt_payload_add_sample(&mqtt_p, 
                                    acce_value.acce_x, acce_value.acce_y, acce_value.acce_z,
                                    gyro_value.gyro_x, gyro_value.gyro_y, gyro_value.gyro_z);
            
            mpu6050_infer_payload_add_sample(&infer_p, 
                                    acce_value.acce_x, acce_value.acce_y, acce_value.acce_z,
                                    gyro_value.gyro_x, gyro_value.gyro_y, gyro_value.gyro_z);
            
            bool should_publish = mqtt_is_connected() && 
                                  mqtt_p.sample_count >= MOTION_PUBLISH_EVERY_N_SAMPLES;

            if (should_publish) {
                char* payload = json_convert_motion(&mqtt_p);
                mqtt_publish_topic(payload, MPU6050_TAG, MQTT_TOPIC_MOTION);
                free(payload);
                mpu6050_mqtt_payload_start(&mqtt_p);
            }

            bool should_inference = infer_p.sample_count >= EI_CLASSIFIER_RAW_SAMPLE_COUNT;

            if (should_inference) {
                bool is_fall = false;
                ret = inference(&infer_p, &is_fall);
                
                if (ret != ESP_OK) {
                    ESP_LOGE("INFERENCE", "Failed to inference");
                    continue;
                }

                if (is_fall & !waiting_confirm) {
                    waiting_confirm = true;
                    ret = local_alert();

                    if (ret != ESP_OK) {
                        ESP_LOGE("ALERT", "Failed to trigger local alert");
                    }
                }
                mpu6050_infer_payload_start(&infer_p);
            }
        }

        vTaskDelay(pdMS_TO_TICKS(1000 / MOTION_SAMPLE_RATE_HZ));
    }
}

void oled_task(void* pvParameters) {
    ssd1306_handle_t oled_screen =  (ssd1306_handle_t) pvParameters;

    char line1[16], line2[16];
    int last_bpm = -1, last_spo2 = -1;
    int current_bpm, current_spo2;

    while (1) {
        max30102_get_beat_avg(&current_bpm);
        max30102_get_spo2(&current_spo2);

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
                free(payload);
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

static char* get_event_payload(event_source_t type) {
    event_payload_start(&pending_event);
    event_payload_add_sample(&pending_event, type);
    return json_convert_event(&pending_event);
}

esp_timer_handle_t get_confirm_timer() {
    return confirm_timer;
}

void button_event_cb(void *arg, void *data) {
    button_event_t event = iot_button_get_event(arg);
    esp_err_t ret;
    ESP_LOGI(BUTTON_TAG, "%s", iot_button_get_event_str(event));

    switch (event) {
        case BUTTON_SINGLE_CLICK:
            if (mqtt_is_connected() && waiting_confirm) {
                waiting_confirm = false;

                esp_timer_stop(confirm_timer);
                
                ESP_LOGI(MQTT_TAG, "sent event");

                char* payload = get_event_payload(EVENT_PAYLOAD_SYSTEM);
                mqtt_publish_topic(payload, BUTTON_TAG, MQTT_TOPIC_EVENT);
                free(payload);   
            }
            break;
        case BUTTON_DOUBLE_CLICK:
            char* payload = get_event_payload(EVENT_PAYLOAD_USER);
            mqtt_publish_topic(payload, BUTTON_TAG, MQTT_TOPIC_EVENT);
            free(payload);

            ret = local_alert();
            
            if (ret != ESP_OK) {
                ESP_LOGE(ALERT_TAG, "Failed to trigger local alert");
            }

            break;
        case BUTTON_LONG_PRESS_START:
            ret = stop_alert();

            if (ret != ESP_OK) {
                ESP_LOGE(ALERT_TAG, "Failed to stop alert");
            }

            break;
        default:
            break;
    }
}

void confirm_timeout_cb(void* arg) {
    if (!waiting_confirm) {
        return;
    }
    
    if (mqtt_is_connected() && waiting_confirm) {
        waiting_confirm = false;

        ESP_LOGI(MQTT_TAG, "sent event");

        char* payload = get_event_payload(EVENT_PAYLOAD_SYSTEM);
        mqtt_publish_topic(payload, BUTTON_TAG, MQTT_TOPIC_EVENT);
        free(payload);
    }
}
