#ifndef MPU6050_H
#define MPU6050_H

#include <stdint.h>

#include "driver/i2c_types.h"
#include "esp_err.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef enum {
    ACCE_FS_2G  = 0,
    ACCE_FS_4G  = 1,
    ACCE_FS_8G  = 2,
    ACCE_FS_16G = 3,
} mpu6050_acce_fs_t;

typedef enum {
    GYRO_FS_250DPS  = 0,
    GYRO_FS_500DPS  = 1,
    GYRO_FS_1000DPS = 2,
    GYRO_FS_2000DPS = 3,
} mpu6050_gyro_fs_t;


typedef struct {
    int16_t raw_acce_x;
    int16_t raw_acce_y;
    int16_t raw_acce_z;
} mpu6050_raw_acce_value_t;

typedef struct {
    int16_t raw_gyro_x;
    int16_t raw_gyro_y;
    int16_t raw_gyro_z;
} mpu6050_raw_gyro_value_t;

typedef struct {
    float acce_x;
    float acce_y;
    float acce_z;
} mpu6050_acce_value_t;

typedef struct {
    float gyro_x;
    float gyro_y;
    float gyro_z;
} mpu6050_gyro_value_t;

typedef void* mpu6050_handle_t;

esp_err_t mpu6050_sensor_init(i2c_master_bus_handle_t bus_handle,
                              i2c_master_dev_handle_t* dev_handle,
                              mpu6050_handle_t* sensor);
void mpu6050_sensor_deinit(i2c_master_dev_handle_t dev_handle, mpu6050_handle_t sensor);

mpu6050_handle_t mpu6050_create(i2c_master_dev_handle_t dev);
void mpu6050_delete(mpu6050_handle_t sensor);
esp_err_t mpu6050_get_deviceid(mpu6050_handle_t sensor, uint8_t* const deviceid);
esp_err_t mpu6050_wakeup(mpu6050_handle_t sensor);
esp_err_t mpu6050_shutdown(mpu6050_handle_t sensor);
esp_err_t mpu6050_config(mpu6050_handle_t sensor, const mpu6050_acce_fs_t acce_fs, const mpu6050_gyro_fs_t gyro_fs);
esp_err_t mpu6050_get_acce_sensitivity(mpu6050_handle_t sensor, float* const acce_sensitivity);
esp_err_t mpu6050_get_gyro_sensitivity(mpu6050_handle_t sensor, float* const gyro_sensitivity);
esp_err_t mpu6050_get_raw_acce(mpu6050_handle_t sensor, mpu6050_raw_acce_value_t* const raw_acce_value);
esp_err_t mpu6050_get_raw_gyro(mpu6050_handle_t sensor, mpu6050_raw_gyro_value_t* const raw_gyro_value);
esp_err_t mpu6050_get_acce(mpu6050_handle_t sensor, mpu6050_acce_value_t* const acce_value);
esp_err_t mpu6050_get_gyro(mpu6050_handle_t sensor, mpu6050_gyro_value_t* const gyro_value);

#ifdef __cplusplus
}
#endif

#endif