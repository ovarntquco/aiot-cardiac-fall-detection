#include "driver/i2c_master.h"
#include "esp_log.h"

#include "config.h"

#include "mpu6050.h"

#define MPU6050_I2C_ADDRESS     0x68u
#define MPU6050_I2C_ADDRESS_1   0x69u
#define MPU6050_WHO_AM_I_VAL    0x68u
#define MPU6050_GYRO_CONFIG     0x1Bu
#define MPU6050_ACCEL_CONFIG    0x1Cu
#define MPU6050_ACCEL_XOUT_H    0x3Bu
#define MPU6050_GYRO_XOUT_H     0x43u
#define MPU6050_PWR_MGMT_1      0x6Bu
#define MPU6050_WHO_AM_I        0x75u

typedef struct {
    i2c_master_dev_handle_t dev;
} mpu6050_dev_t;

static esp_err_t mpu6050_write(mpu6050_handle_t sensor, uint8_t reg_addr, uint8_t* const data_buf, size_t data_len) {
    mpu6050_dev_t* sens = sensor;
    uint8_t* buffer = malloc(sizeof(*buffer) * (data_len + 1));
    if (NULL == buffer) {
        ESP_LOGE(MPU6050_TAG, "Failed to allocate memory for buffer during write");
        return ESP_ERR_NO_MEM;
    }

    buffer[0] = reg_addr;
    memcpy(&buffer[1], data_buf, data_len);
    esp_err_t ret = i2c_master_transmit(
        sens->dev,
        buffer,
        data_len + 1,
        -1
    );
    free(buffer);

    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "i2c_master failed to transmit: %s", esp_err_to_name(ret));
        return ret;
    }
    return ESP_OK;
}

static esp_err_t mpu6050_read(mpu6050_handle_t sensor, uint8_t reg_addr, uint8_t* const data_buf, size_t data_len) {
    mpu6050_dev_t* sens = sensor;
    esp_err_t ret = i2c_master_transmit_receive(
        sens->dev,
        &reg_addr,
        1,
        data_buf,
        data_len,
        -1
    );
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "i2c_master failed to transmit-receive: %s", esp_err_to_name(ret));
        return ret;
    }
    return ESP_OK;
}

static mpu6050_handle_t mpu6050_create(i2c_master_dev_handle_t dev) {
    mpu6050_dev_t* const sensor = calloc(1, sizeof(mpu6050_dev_t));
    if (NULL == sensor) {
        ESP_LOGE(MPU6050_TAG, "Failed to allocate memory for sensor");
        return NULL;
    }
    sensor->dev = dev;
    return (mpu6050_handle_t) sensor;
}

static esp_err_t mpu6050_delete(mpu6050_handle_t sensor) {
    if (NULL == sensor) {
        ESP_LOGE(MPU6050_TAG, "Failed to delete sensor, sensor is NULL");
        return ESP_ERR_INVALID_ARG;
    }

    mpu6050_dev_t* const sens = sensor;
    free(sens);
    return ESP_OK;
}

static esp_err_t mpu6050_wakeup(mpu6050_handle_t sensor) {
    uint8_t tmp;
    esp_err_t ret = mpu6050_read(sensor, MPU6050_PWR_MGMT_1, &tmp, 1);
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to read during wakeup: %s", esp_err_to_name(ret));
        return ret;
    }

    tmp &= (~BIT6);
    ret = mpu6050_write(sensor, MPU6050_PWR_MGMT_1, &tmp, 1);
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to write during wakeup: %s", esp_err_to_name(ret));
        return ret;
    }
    return ESP_OK;
}

static esp_err_t mpu6050_shutdown(mpu6050_handle_t sensor) {
    uint8_t tmp;
    esp_err_t ret = mpu6050_read(sensor, MPU6050_PWR_MGMT_1, &tmp, 1);
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to read during shutdown: %s", esp_err_to_name(ret));
        return ret;
    }

    tmp |= BIT6;
    ret = mpu6050_write(sensor, MPU6050_PWR_MGMT_1, &tmp, 1);
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to write during shutdown: %s", esp_err_to_name(ret));
        return ret;
    }
    return ESP_OK;
}

static esp_err_t mpu6050_config(mpu6050_handle_t sensor, mpu6050_acce_fs_t acce_fs, mpu6050_gyro_fs_t gyro_fs) {
    uint8_t config_regs[2] = {gyro_fs << 3,  acce_fs << 3};
    esp_err_t ret = mpu6050_write(sensor, MPU6050_GYRO_CONFIG, config_regs, sizeof(config_regs));
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to write during config: %s", esp_err_to_name(ret));
        return ret;
    }
    return ESP_OK;
}

static esp_err_t mpu6050_get_acce_sensitivity(mpu6050_handle_t sensor, float* const acce_sensitivity) {
    uint8_t acce_fs;
    esp_err_t ret = mpu6050_read(sensor, MPU6050_ACCEL_CONFIG, &acce_fs, 1);
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to read during get-acce-sensitivity: %s", esp_err_to_name(ret));
        return ret;
    }

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
    return ESP_OK;
}

static esp_err_t mpu6050_get_gyro_sensitivity(mpu6050_handle_t sensor, float* const gyro_sensitivity) {
    uint8_t gyro_fs;
    esp_err_t ret = mpu6050_read(sensor, MPU6050_GYRO_CONFIG, &gyro_fs, 1);
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to read during get-gyro-sensitivity: %s", esp_err_to_name(ret));
        return ret;
    }

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
    return ESP_OK;
}

static esp_err_t mpu6050_get_raw_acce(mpu6050_handle_t sensor, mpu6050_raw_acce_value_t* const raw_acce_value) {
    uint8_t data_rd[6];
    esp_err_t ret = mpu6050_read(sensor, MPU6050_ACCEL_XOUT_H, data_rd, sizeof(data_rd));
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to read during get-raw-acce: %s", esp_err_to_name(ret));
        return ret;
    }

    raw_acce_value->raw_acce_x = (int16_t)((data_rd[0] << 8) + (data_rd[1]));
    raw_acce_value->raw_acce_y = (int16_t)((data_rd[2] << 8) + (data_rd[3]));
    raw_acce_value->raw_acce_z = (int16_t)((data_rd[4] << 8) + (data_rd[5]));
    return ESP_OK;
}

static esp_err_t mpu6050_get_raw_gyro(mpu6050_handle_t sensor, mpu6050_raw_gyro_value_t* const raw_gyro_value) {
    uint8_t data_rd[6];
    esp_err_t ret = mpu6050_read(sensor, MPU6050_GYRO_XOUT_H, data_rd, sizeof(data_rd));
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to read during get-raw-gyro: %s", esp_err_to_name(ret));
        return ret;
    }

    raw_gyro_value->raw_gyro_x = (int16_t)((data_rd[0] << 8) + (data_rd[1]));
    raw_gyro_value->raw_gyro_y = (int16_t)((data_rd[2] << 8) + (data_rd[3]));
    raw_gyro_value->raw_gyro_z = (int16_t)((data_rd[4] << 8) + (data_rd[5]));
    return ESP_OK;
}

esp_err_t mpu6050_get_deviceid(mpu6050_handle_t sensor, uint8_t* const deviceid) {
    esp_err_t ret = mpu6050_read(sensor, MPU6050_WHO_AM_I, deviceid, 1);
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to read during get-deviceid: %s", esp_err_to_name(ret));
        return ret;
    }
    return ESP_OK;
}

esp_err_t mpu6050_get_acce(mpu6050_handle_t sensor, mpu6050_acce_value_t* const acce_value) {
    mpu6050_raw_acce_value_t raw_acce;
    float acce_sensitivity;
    esp_err_t ret = mpu6050_get_acce_sensitivity(sensor, &acce_sensitivity);
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to get-acce-sensitivity during get-acce: %s", esp_err_to_name(ret));
        return ret;
    }
    
    ret = mpu6050_get_raw_acce(sensor, &raw_acce);
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to get-raw-acce during get-acce: %s", esp_err_to_name(ret));
        return ret;
    }

    acce_value->acce_x = raw_acce.raw_acce_x / acce_sensitivity;
    acce_value->acce_y = raw_acce.raw_acce_y / acce_sensitivity;
    acce_value->acce_z = raw_acce.raw_acce_z / acce_sensitivity;
    return ESP_OK;
}

esp_err_t mpu6050_get_gyro(mpu6050_handle_t sensor, mpu6050_gyro_value_t* const gyro_value) {
    mpu6050_raw_gyro_value_t raw_gyro;
    float gyro_sensitivity;
    esp_err_t ret = mpu6050_get_gyro_sensitivity(sensor, &gyro_sensitivity);
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to get-gyro-sensitivity during get-gyro: %s", esp_err_to_name(ret));
        return ret;
    }
    
    ret = mpu6050_get_raw_gyro(sensor, &raw_gyro);
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "Failed to get-raw-gyro during get-gyro: %s", esp_err_to_name(ret));
        return ret;
    }

    gyro_value->gyro_x = raw_gyro.raw_gyro_x / gyro_sensitivity;
    gyro_value->gyro_y = raw_gyro.raw_gyro_y / gyro_sensitivity;
    gyro_value->gyro_z = raw_gyro.raw_gyro_z / gyro_sensitivity;
    return ESP_OK;
}

esp_err_t mpu6050_sensor_init(i2c_master_bus_handle_t bus_handle,
                              i2c_master_dev_handle_t* const dev_handle,
                              mpu6050_handle_t* const sensor) {
    i2c_device_config_t dev_cfg = {
        .dev_addr_length = I2C_ADDR_BIT_LEN_7,
        .device_address = MPU6050_I2C_ADDRESS,
        .scl_speed_hz = I2C_SPEED_HZ,
    };

    esp_err_t ret = i2c_master_bus_add_device(bus_handle, &dev_cfg, dev_handle);
    if (ret != ESP_OK) {
        ESP_LOGE(MPU6050_TAG, "i2c_master_bus failed to add device: %s", esp_err_to_name(ret));
        return ret;
    }

    *sensor = mpu6050_create(*dev_handle);
    if (NULL == *sensor) {
        ESP_LOGE(MPU6050_TAG, "Failed to create sensor during init");
        i2c_master_bus_rm_device(*dev_handle);
        *dev_handle = NULL;
        return ESP_ERR_NO_MEM;
    }

    ret = mpu6050_config(*sensor, ACCE_FS_2G, GYRO_FS_250DPS);
    if (ESP_OK != ret) {
        ESP_LOGE(MPU6050_TAG, "Failed to config sensor during init: %s", esp_err_to_name(ret));
        goto cleanup;
    }

    ret = mpu6050_wakeup(*sensor);
    if (ESP_OK != ret) {
        ESP_LOGE(MPU6050_TAG, "Failed to wakeup sensor during init: %s", esp_err_to_name(ret));
        goto cleanup;
    }

    return ESP_OK;

cleanup:
    mpu6050_delete(*sensor);
    *sensor = NULL;
    i2c_master_bus_rm_device(*dev_handle);
    *dev_handle = NULL;
    return ret;
}

void mpu6050_sensor_deinit(i2c_master_dev_handle_t dev_handle, mpu6050_handle_t sensor) {
    if (sensor) {
        esp_err_t ret = mpu6050_delete(sensor);
        if (ret != ESP_OK) {
            ESP_LOGE(MPU6050_TAG, "Failed to delete sensor during deinit: %s", esp_err_to_name(ret));
        }
    }
    if (dev_handle) {
        esp_err_t ret = i2c_master_bus_rm_device(dev_handle);
        if (ret != ESP_OK) {
            ESP_LOGE(MPU6050_TAG, "i2c_master failed to remove device during deinit: %s", esp_err_to_name(ret));
        }
    }
}
