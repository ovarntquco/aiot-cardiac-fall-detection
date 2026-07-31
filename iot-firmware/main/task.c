#include "esp_log.h"

#include "mqtt_helper.h"
#include "json_helper.h"

#include "mpu6050.h"
#include "mpu6050_batch.h"

void mpu6050_task(void* pvParameters) {
    mpu6050_handle_t sensor = pvParameters;

    mpu6050_acce_value_t acce_value;
    mpu6050_gyro_value_t gyro_value;
    mpu6050_batch_t batch;
    mpu6050_batch_start(&batch);

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
            ESP_LOGI(MPU6050_TAG,"acce_x=%.3f acce_y=%.3f acce_z=%.3f | gyro_x=%.3f gyro_y=%.3f gyro_z=%.3f",
                     acce_value.acce_x, acce_value.acce_y, acce_value.acce_z,
                     gyro_value.gyro_x, gyro_value.gyro_y, gyro_value.gyro_z);

            mpu6050_batch_add_sample(&batch, 
                                    acce_value.acce_x, acce_value.acce_y, acce_value.acce_z,
                                    gyro_value.gyro_x, gyro_value.gyro_y, gyro_value.gyro_z);
            
            bool should_publish = mqtt_is_connected() && batch.sample_count >= MOTION_PUBLISH_EVERY_N_SAMPLES;

            if (should_publish) {
                char* payload = json_convert_motion(&batch);
                mqtt_publish_topic(payload, MPU6050_TAG, MQTT_TOPIC_MOTION);
                mpu6050_batch_start(&batch);
            }
        }

        vTaskDelay(pdMS_TO_TICKS(1000 / SAMPLE_RATE_HZ));
    }
}
