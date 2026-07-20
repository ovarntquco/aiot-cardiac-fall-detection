#include <string.h>
#include <stdint.h>
#include <sys/time.h>
#include <stddef.h>

#include "driver/i2c_master.h"

#include "include/mpu6050.h"

/* MPU6050 register */
#define MPU6050_GYRO_CONFIG     0x1Bu
#define MPU6050_ACCEL_CONFIG    0x1Cu
#define MPU6050_ACCEL_XOUT_H    0x3Bu
#define MPU6050_GYRO_XOUT_H     0x43u
#define MPU6050_PWR_MGMT_1      0x6Bu
#define MPU6050_WHO_AM_I        0x75u

typedef struct {
    i2c_master_dev_handle_t i2c_dev;
} mpu6050_dev_t;

static esp_err_t mpu6050_write(mpu6050_handle_t sensor,
                               const uint8_t reg_start_addr,
                               const uint8_t *const data_buf,
                               const uint8_t data_len) {
    mpu6050_dev_t *sens = (mpu6050_dev_t *) sensor;
    uint8_t buffer[data_len + 1];
    
    buffer[0] = reg_start_addr;
    memcpy(&buffer[1], data_buf, data_len);

    return i2c_master_transmit(sens->i2c_dev,
                               buffer,
                               sizeof(buffer),
                               -1);
}

static esp_err_t mpu6050_read(mpu6050_handle_t sensor,
                              const uint8_t reg_start_addr,
                              uint8_t *const data_buf,
                              const uint8_t data_len) {
    mpu6050_dev_t *sens = (mpu6050_dev_t *) sensor;

    return i2c_master_transmit_receive(sens->i2c_dev,
                                       &reg_start_addr,
                                       1,
                                       data_buf,
                                       data_len,
                                       -1);
}

mpu6050_handle_t mpu6050_create(i2c_master_dev_handle_t dev) {
    mpu6050_dev_t *sensor = (mpu6050_dev_t *) calloc(1, sizeof(mpu6050_dev_t));
    sensor->i2c_dev = dev;

    return (mpu6050_handle_t) sensor;
}

void mpu6050_delete(mpu6050_handle_t sensor) {
    mpu6050_dev_t *sens = (mpu6050_dev_t *) sensor;
    free(sens);
}

esp_err_t mpu6050_get_deviceid(mpu6050_handle_t sensor, uint8_t *const deviceid) {
    return mpu6050_read(sensor, MPU6050_WHO_AM_I, deviceid, 1);
}

esp_err_t mpu6050_wake_up(mpu6050_handle_t sensor) {
    esp_err_t ret;
    uint8_t tmp;

    ret = mpu6050_read(sensor, MPU6050_PWR_MGMT_1, &tmp, 1);
    if (ESP_OK != ret) {
        return ret;
    }

    tmp &= (~BIT6);
    ret = mpu6050_write(sensor, MPU6050_PWR_MGMT_1, &tmp, 1);
    return ret;
}

esp_err_t mpu6050_sleep(mpu6050_handle_t sensor) {
    esp_err_t ret;
    uint8_t tmp;

    ret = mpu6050_read(sensor, MPU6050_PWR_MGMT_1, &tmp, 1);
    if (ESP_OK != ret) {
        return ret;
    }

    tmp |= BIT6;
    ret = mpu6050_write(sensor, MPU6050_PWR_MGMT_1, &tmp, 1);
    return ret;
}

esp_err_t mpu6050_config(mpu6050_handle_t sensor, const mpu6050_acce_fs_t acce_fs, const mpu6050_gyro_fs_t gyro_fs) {
    uint8_t config_regs[2] = {gyro_fs << 3,  acce_fs << 3};
    return mpu6050_write(sensor, MPU6050_GYRO_CONFIG, config_regs, sizeof(config_regs));
}

esp_err_t mpu6050_get_acce_sensitivity(mpu6050_handle_t sensor, float *const acce_sensitivity) {
    esp_err_t ret;
    uint8_t acce_fs;

    ret = mpu6050_read(sensor, MPU6050_ACCEL_CONFIG, &acce_fs, 1);

    acce_fs = (acce_fs >> 3) & 0x03;
    switch (acce_fs) {
    case ACCE_FS_2G:
        *acce_sensitivity = 16384;
        break;
    case ACCE_FS_4G:
        *acce_sensitivity = 8192;
        break;
    case ACCE_FS_8G:
        *acce_sensitivity = 4096;
        break;
    case ACCE_FS_16G:
        *acce_sensitivity = 2048;
        break;
    default:
        break;
    }
    return ret;
}

esp_err_t mpu6050_get_gyro_sensitivity(mpu6050_handle_t sensor, float *const gyro_sensitivity) {
    esp_err_t ret;
    uint8_t gyro_fs;

    ret = mpu6050_read(sensor, MPU6050_GYRO_CONFIG, &gyro_fs, 1);

    gyro_fs = (gyro_fs >> 3) & 0x03;
    switch (gyro_fs) {
    case GYRO_FS_250DPS:
        *gyro_sensitivity = 131;
        break;
    case GYRO_FS_500DPS:
        *gyro_sensitivity = 65.5;
        break;
    case GYRO_FS_1000DPS:
        *gyro_sensitivity = 32.8;
        break;
    case GYRO_FS_2000DPS:
        *gyro_sensitivity = 16.4;
        break;
    default:
        break;
    }
    return ret;
}

esp_err_t mpu6050_get_raw_acce(mpu6050_handle_t sensor, mpu6050_raw_acce_value_t *const raw_acce_value) {
    uint8_t data_rd[6];
    esp_err_t ret = mpu6050_read(sensor, MPU6050_ACCEL_XOUT_H, data_rd, sizeof(data_rd));
    
    raw_acce_value->raw_acce_x = (int16_t)((data_rd[0] << 8) + (data_rd[1]));
    raw_acce_value->raw_acce_y = (int16_t)((data_rd[2] << 8) + (data_rd[3]));
    raw_acce_value->raw_acce_z = (int16_t)((data_rd[4] << 8) + (data_rd[5]));
    return ret;
}

esp_err_t mpu6050_get_raw_gyro(mpu6050_handle_t sensor, mpu6050_raw_gyro_value_t *const raw_gyro_value) {
    uint8_t data_rd[6];
    esp_err_t ret = mpu6050_read(sensor, MPU6050_GYRO_XOUT_H, data_rd, sizeof(data_rd));
    
    raw_gyro_value->raw_gyro_x = (int16_t)((data_rd[0] << 8) + (data_rd[1]));
    raw_gyro_value->raw_gyro_y = (int16_t)((data_rd[2] << 8) + (data_rd[3]));
    raw_gyro_value->raw_gyro_z = (int16_t)((data_rd[4] << 8) + (data_rd[5]));
    return ret;
}

esp_err_t mpu6050_get_acce(mpu6050_handle_t sensor, mpu6050_acce_value_t *const acce_value) {
    esp_err_t ret;
    float acce_sensitivity;
    mpu6050_raw_acce_value_t raw_acce;

    ret = mpu6050_get_acce_sensitivity(sensor, &acce_sensitivity);
    if (ret != ESP_OK) {
        return ret;
    }
    ret = mpu6050_get_raw_acce(sensor, &raw_acce);
    if (ret != ESP_OK) {
        return ret;
    }

    acce_value->acce_x = raw_acce.raw_acce_x / acce_sensitivity;
    acce_value->acce_y = raw_acce.raw_acce_y / acce_sensitivity;
    acce_value->acce_z = raw_acce.raw_acce_z / acce_sensitivity;
    return ESP_OK;
}

esp_err_t mpu6050_get_gyro(mpu6050_handle_t sensor, mpu6050_gyro_value_t *const gyro_value) {
    esp_err_t ret;
    float gyro_sensitivity;
    mpu6050_raw_gyro_value_t raw_gyro;

    ret = mpu6050_get_gyro_sensitivity(sensor, &gyro_sensitivity);
    if (ret != ESP_OK) {
        return ret;
    }
    ret = mpu6050_get_raw_gyro(sensor, &raw_gyro);
    if (ret != ESP_OK) {
        return ret;
    }

    gyro_value->gyro_x = raw_gyro.raw_gyro_x / gyro_sensitivity;
    gyro_value->gyro_y = raw_gyro.raw_gyro_y / gyro_sensitivity;
    gyro_value->gyro_z = raw_gyro.raw_gyro_z / gyro_sensitivity;
    return ESP_OK;
}