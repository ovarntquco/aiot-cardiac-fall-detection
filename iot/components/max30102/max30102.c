#include "string.h"

#include "driver/i2c_master.h"
#include "esp_log.h"
#include "esp_timer.h"
#include "freertos/FreeRTOS.h"

#include "config.h"

#include "max30102.h"

#define CARDIAC_REQUIRED_STABLE_SAMPLES 300
#define CARDIAC_REQUIRED_EVENT_SAMPLES  200

#define MAX30102_WAKEUP     0x00
#define MAX30102_RESET      0x40
#define MAX30102_SHUTDOWN   0x80

#define MAX30102_FIFOWRITEPTR   0x04
#define MAX30102_FIFOOVERFLOW   0x05
#define MAX30102_FIFOREADPTR    0x06
#define MAX30102_FIFODATA       0x07

#define MAX30102_FIFOCONFIG     0x08
#define MAX30102_MODECONFIG     0x09
#define MAX30102_SPO2CONFIG     0x0A
#define MAX30102_LED1_PULSEAMP  0x0C
#define MAX30102_LED2_PULSEAMP  0x0D

#define MAX30102_SAMPLEAVG_MASK     0x1F
#define MAX30102_ROLLOVER_MASK      0xEF
#define MAX30102_FIFO_A_FULL_MASK   0xF0

#define MAX30102_SHUTDOWN_MASK      0x7F
#define MAX30102_RESET_MASK         0xBF
#define MAX30102_MODE_MASK          0xF8

#define MAX30102_ADCRANGE_MASK      0x9F
#define MAX30102_SAMPLERATE_MASK    0xE3
#define MAX30102_PULSEWIDTH_MASK    0xFC

#define MAX30102_I2C_ADDRESS    0x57
#define MAX30102_REV_ID         0xFE
#define MAX30102_PART_ID        0xFF

#ifndef min
#define min(x, y) ((x) < (y) ? (x) : (y))
#endif

typedef struct {
    uint8_t offset;
    int16_t ir_ac_max;
    int16_t ir_ac_min;
    int16_t ir_ac_signal_curr;
    int16_t ir_ac_signal_prev;
    int16_t ir_ac_signal_min;
    int16_t ir_ac_signal_max;
    int16_t ir_avg_estimated;
    int16_t positive_edge;
    int16_t negative_edge;
    int16_t cbuf[32];
    int32_t ir_avg_reg;
    uint16_t fir_coeffs[12];
} max30102_heartrate_algo_t;

typedef struct {
    uint8_t uch_spo2_table[184];
    int32_t an_x[CARDIAC_BUFFER_SIZE];
    int32_t an_y[CARDIAC_BUFFER_SIZE];
} max30102_spo2_algo_t;

typedef struct {
    i2c_master_dev_handle_t dev;
    max30102_heartrate_algo_t hr_algo;
    max30102_spo2_algo_t spo2_algo;
} max30102_dev_t;

typedef struct {
    int beat_avg;
    int32_t spo2;
    int hr_low;
    int hr_high;
    int spo2_low;
} max30102_stats_t;

static max30102_stats_t s_stats = {
    .beat_avg = 0,
    .spo2 = -999,
    .hr_low = 60,
    .hr_high = 100,
    .spo2_low = 80,
};

static inline int32_t mul16(int16_t x, int16_t y) {
    return (int32_t)x * (int32_t)y;
}

static esp_err_t max30102_write(max30102_handle_t sensor, uint8_t reg_addr, uint8_t* const data_buf, size_t data_len) {
    max30102_dev_t* const sens = sensor;
    uint8_t* const buffer = malloc(sizeof(*buffer) * (data_len + 1));
    if (NULL == buffer) {
        ESP_LOGE(MAX30102_TAG, "Failed to allocate memory for buffer during during write");
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
        ESP_LOGE(MAX30102_TAG, "i2c_master failed to transmit: %s", esp_err_to_name(ret));
        return ret;
    }
    return ESP_OK;
}

static esp_err_t max30102_read(max30102_handle_t sensor, uint8_t reg_addr, uint8_t* const data_buf, size_t data_len) {
    max30102_dev_t* const sens = sensor;
    esp_err_t ret = i2c_master_transmit_receive(
        sens->dev,
        &reg_addr,
        1,
        data_buf,
        data_len,
        -1
    );
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "i2c_master failed to transmit-receive: %s", esp_err_to_name(ret));
        return ret;
    }
    return ESP_OK;
}

static esp_err_t max30102_bitmask(max30102_handle_t sensor, uint8_t reg_addr, uint8_t mask, uint8_t thing) {
    uint8_t original_contents;
    esp_err_t ret = max30102_read(sensor, reg_addr, &original_contents, 1);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to read from reg_addr during bitmask: %s", esp_err_to_name(ret));
        return ret;
    }

    original_contents &= mask;
    original_contents |= thing;

    ret = max30102_write(sensor, reg_addr, &original_contents, 1);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to write to reg_addr during bitmask: %s", esp_err_to_name(ret));
        return ret;
    }
    return ESP_OK;
}

static esp_err_t max30102_soft_reset(max30102_handle_t sensor) {
    esp_err_t ret = max30102_bitmask(sensor, MAX30102_MODECONFIG, MAX30102_RESET_MASK, MAX30102_RESET);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to bitmask during soft-reset: %s", esp_err_to_name(ret));
        return ret;
    }

    int64_t start_time_us = esp_timer_get_time();
    while ((esp_timer_get_time() - start_time_us) < 100000) {
        uint8_t response;
        ret = max30102_read(sensor, MAX30102_MODECONFIG, &response, 1);
        if (ESP_OK == ret && 0 == (response & MAX30102_RESET)) {
            return ESP_OK;
        }
        vTaskDelay(pdMS_TO_TICKS(1));
    }
    return ESP_ERR_TIMEOUT;
}

static int16_t max30102_avg_dc_estimator(int32_t* const p, uint16_t x) {
    *p += ((((int32_t)x << 15) - *p) >> 4);
    return (int16_t)(*p >> 15);
}

static int16_t max30102_low_pass_fir_filter(int16_t* const cbuf, uint8_t* const offset, uint16_t* const fir_coeffs, int16_t din) {
    cbuf[*offset] = din;
    int32_t z = mul16(fir_coeffs[11], cbuf[(*offset - 11) & 0x1F]);
    for (uint8_t i = 0; i < 11; ++i) {
        z += mul16(fir_coeffs[i], cbuf[(*offset - i) & 0x1F] + cbuf[(*offset - 22 + i) & 0x1F]);
    }

    ++(*offset);
    (*offset) %= 32;
    return (int16_t) (z >> 15);
}

static void max30102_peaks_above_min_height(int32_t* const pn_locs, int32_t* const n_npks, int32_t* const pn_x, int32_t n_size, int32_t n_min_height) {
    int32_t i = 1;
    int32_t n_width;
    *n_npks = 0;

    while (i < n_size - 1) {
        if (pn_x[i] > n_min_height && pn_x[i] > pn_x[i - 1]) {
            n_width = 1;

            while (i + n_width < n_size && pn_x[i] == pn_x[i + n_width]) {
                ++n_width;
            }

            if (pn_x[i] > pn_x[i + n_width] && (*n_npks) < 15) {
                pn_locs[(*n_npks)++] = i;
                i += n_width + 1;
            } else {
                i += n_width;
            }
        } else {
            ++i;
        }
    }
}

static void max30102_sort_ascend(int32_t* const pn_x, int32_t n_size) {
    int32_t i, j, n_temp;
    for (i = 1; i < n_size; ++i) {
        n_temp = pn_x[i];
        for (j = i; j > 0 && n_temp < pn_x[j - 1]; --j) {
            pn_x[j] = pn_x[j - 1];
        }
        pn_x[j] = n_temp;
    }
}

static void max30102_sort_indices_descend(int32_t* const pn_x, int32_t* const pn_indx, int32_t n_size) {
    int32_t i, j, n_temp;
    for (i = 1; i < n_size; ++i) {
        n_temp = pn_indx[i];
        for (j = i; j > 0 && pn_x[n_temp] > pn_x[pn_indx[j - 1]]; --j) {
            pn_indx[j] = pn_indx[j - 1];
        }
        pn_indx[j] = n_temp;
    }
}

static void max30102_remove_close_peaks(int32_t* const pn_locs, int32_t* const pn_npks, int32_t* const pn_x, int32_t n_min_distance) {
    int32_t i, j, n_old_npks, n_dist;
    max30102_sort_indices_descend(pn_x, pn_locs, *pn_npks);
    for (i = -1; i < *pn_npks; ++i) {
        n_old_npks = *pn_npks;
        *pn_npks = i + 1;
        for (j = i + 1; j < n_old_npks; ++j) {
            n_dist = pn_locs[j] - (i == -1 ? -1 : pn_locs[i]);
            if (n_dist > n_min_distance || n_dist < -n_min_distance) {
                pn_locs[(*pn_npks)++] = pn_locs[j];
            }
        }
    }
    max30102_sort_ascend(pn_locs, *pn_npks);
}

static void max30102_find_peaks(int32_t* const pn_locs, int32_t* const n_npks, int32_t* const pn_x, int32_t n_size, int32_t n_min_height, int32_t n_min_distance, int32_t n_max_num) {
    max30102_peaks_above_min_height(pn_locs, n_npks, pn_x, n_size, n_min_height);
    max30102_remove_close_peaks(pn_locs, n_npks, pn_x, n_min_distance);
    *n_npks = min(*n_npks, n_max_num);
}

static max30102_handle_t max30102_create(i2c_master_dev_handle_t dev) {
    max30102_dev_t* const sensor = calloc(1, sizeof(max30102_dev_t));
    if (NULL == sensor) {
        ESP_LOGE(MAX30102_TAG, "Failed to allocate memory for sensor");
        return NULL;
    }
    sensor->dev = dev;
    return (max30102_handle_t) sensor;
}

static esp_err_t max30102_delete(max30102_handle_t sensor) {
    if (NULL == sensor) {
        ESP_LOGE(MAX30102_TAG, "Failed to delete sensor, sensor is NULL");
        return ESP_ERR_INVALID_ARG;
    }

    max30102_dev_t* const sens = sensor;
    free(sens);
    return ESP_OK;
}

static esp_err_t max30102_wakeup(max30102_handle_t sensor) {
    esp_err_t ret = max30102_bitmask(sensor, MAX30102_MODECONFIG, MAX30102_SHUTDOWN_MASK, MAX30102_WAKEUP);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to bitmask during wakeup: %s", esp_err_to_name(ret));
        return ret;
    }
    return ESP_OK;
}

static esp_err_t max30102_shutdown(max30102_handle_t sensor) {
    esp_err_t ret = max30102_bitmask(sensor, MAX30102_MODECONFIG, MAX30102_SHUTDOWN_MASK, MAX30102_SHUTDOWN);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to bitmask during shutdown");
        return ret;
    }
    return ESP_OK;
}

static esp_err_t max30102_config(max30102_handle_t sensor, max30102_mode_t mode,
                                 max30102_smp_avg_t sample_average, uint8_t rollover_en, max30102_fifo_a_full_t fifo_a_full,
                                 max30102_adc_rng_t adc_range, max30102_smp_rate_t sample_rate, max30102_led_pw_t pulse_width,
                                 max30102_led_pa_t pulse_amplitute) {
    esp_err_t ret = max30102_soft_reset(sensor);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to soft-reset during config: %s", esp_err_to_name(ret));
        return ret;
    }

    ret = max30102_bitmask(sensor, MAX30102_MODECONFIG, MAX30102_MODE_MASK, mode);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to config mode: %s", esp_err_to_name(ret));
        return ret;
    }

    ret = max30102_bitmask(sensor, MAX30102_FIFOCONFIG, MAX30102_SAMPLEAVG_MASK, sample_average);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to config sample-average: %s", esp_err_to_name(ret));
        return ret;
    }

    ret = max30102_bitmask(sensor, MAX30102_FIFOCONFIG, MAX30102_ROLLOVER_MASK, rollover_en << 4);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to config rollover: %s", esp_err_to_name(ret));
        return ret;
    }

    ret = max30102_bitmask(sensor, MAX30102_FIFOCONFIG, MAX30102_FIFO_A_FULL_MASK, fifo_a_full);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to config fifo-a-full: %s", esp_err_to_name(ret));
        return ret;
    }

    ret = max30102_bitmask(sensor, MAX30102_SPO2CONFIG, MAX30102_ADCRANGE_MASK, adc_range);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to config adc-range: %s", esp_err_to_name(ret));
        return ret;
    }
    
    ret = max30102_bitmask(sensor, MAX30102_SPO2CONFIG, MAX30102_SAMPLERATE_MASK, sample_rate);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to config sample-rate: %s", esp_err_to_name(ret));
        return ret;
    }

    ret = max30102_bitmask(sensor, MAX30102_SPO2CONFIG, MAX30102_PULSEWIDTH_MASK, pulse_width);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to config pulsewidth: %s", esp_err_to_name(ret));
        return ret;
    }

    uint8_t pa =(uint8_t) pulse_amplitute;
    ret = max30102_write(sensor, MAX30102_LED1_PULSEAMP, &pa, 1);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to config pulseamp-1: %s", esp_err_to_name(ret));
        return ret;
    }

    ret = max30102_write(sensor, MAX30102_LED2_PULSEAMP, &pa, 1);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to config pulseamp-2: %s", esp_err_to_name(ret));
        return ret;
    }

    ret = max30102_clear_fifo(sensor);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to clear fifo during config: %s", esp_err_to_name(ret));
        return ret;
    }
    return ESP_OK;
}

esp_err_t max30102_clear_fifo(max30102_handle_t sensor) {
    uint8_t zero = 0;
    esp_err_t ret = max30102_write(sensor, MAX30102_FIFOWRITEPTR, &zero, 1); 
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to write to FIFOWRITEPTR during clear FIFO: %s", esp_err_to_name(ret));
        return ret;
    }
    ret = max30102_write(sensor, MAX30102_FIFOOVERFLOW, &zero, 1);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to write to FIFOOVERFLOW during clear FIFO: %s", esp_err_to_name(ret));
        return ret;
    }
    ret = max30102_write(sensor, MAX30102_FIFOREADPTR, &zero, 1);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to write to FIFOREADPTR during clear FIFO: %s", esp_err_to_name(ret));
        return ret;
    }
    return ESP_OK;
}

esp_err_t max30102_read_fifo(max30102_handle_t sensor, uint32_t* const red, uint32_t* const ir) {
    uint8_t buf[6];
    esp_err_t ret = max30102_read(sensor, MAX30102_FIFODATA, buf, 6);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to read from FIFODATA during read FIFO: %s", esp_err_to_name(ret));
        return ret;
    }

    *red = (((uint32_t)buf[0] << 16) | ((uint32_t)buf[1] << 8) | buf[2]) & 0x03FFFF;
    *ir = (((uint32_t)buf[3] << 16) | ((uint32_t)buf[4] << 8) | buf[5]) & 0x03FFFF;
    return ESP_OK;
}

void max30102_heartrate_algo_reset(max30102_handle_t sensor) {
    max30102_dev_t* const sens = sensor;
    sens->hr_algo = (max30102_heartrate_algo_t) {
        .ir_ac_max = 20,
        .ir_ac_min = -20,
        .ir_ac_signal_curr = 0,
        .ir_ac_signal_prev = 0,
        .ir_ac_signal_min = 0,
        .ir_ac_signal_max = 0,
        .ir_avg_estimated = 0,
        .positive_edge = 0,
        .negative_edge = 0,
        .ir_avg_reg = 0,
        .offset = 0,
        .fir_coeffs = {
            172, 321, 579, 927, 1360, 1858, 2390, 2916, 3391, 3768, 4012, 4096
        },
    };
}

void max30102_spo2_algo_reset(max30102_handle_t sensor) {
    max30102_dev_t* const sens = sensor;
    sens->spo2_algo = (max30102_spo2_algo_t) {
        .uch_spo2_table = {
            95, 95, 95, 96, 96, 96, 97, 97, 97, 97, 97, 98, 98, 98, 98, 98, 99, 99, 99, 99,
            99, 99, 99, 99, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100,
            100, 100, 100, 100, 99, 99, 99, 99, 99, 99, 99, 99, 98, 98, 98, 98, 98, 98, 97, 97,
            97, 97, 96, 96, 96, 96, 95, 95, 95, 94, 94, 94, 93, 93, 93, 92, 92, 92, 91, 91,
            90, 90, 89, 89, 89, 88, 88, 87, 87, 86, 86, 85, 85, 84, 84, 83, 82, 82, 81, 81,
            80, 80, 79, 78, 78, 77, 76, 76, 75, 74, 74, 73, 72, 72, 71, 70, 69, 69, 68, 67,
            66, 66, 65, 64, 63, 62, 62, 61, 60, 59, 58, 57, 56, 56, 55, 54, 53, 52, 51, 50,
            49, 48, 47, 46, 45, 44, 43, 42, 41, 40, 39, 38, 37, 36, 35, 34, 33, 31, 30, 29,
            28, 27, 26, 25, 23, 22, 21, 20, 19, 17, 16, 15, 14, 12, 11, 10, 9, 7, 6, 5,
            3, 2, 1
        }
    };
}

esp_err_t max30102_sensor_init(i2c_master_bus_handle_t bus_handle,
                               i2c_master_dev_handle_t* const dev_handle,
                               max30102_handle_t* const sensor) {
    i2c_device_config_t dev_cfg = {
        .dev_addr_length = I2C_ADDR_BIT_LEN_7,
        .device_address = MAX30102_I2C_ADDRESS,
        .scl_speed_hz = I2C_SPEED_HZ,
    };

    esp_err_t ret = i2c_master_bus_add_device(bus_handle, &dev_cfg, dev_handle);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "i2c_master_bus failed to add device: %s", esp_err_to_name(ret));
        return ret;
    }

    *sensor = max30102_create(*dev_handle);
    if (NULL == *sensor) {
        ESP_LOGE(MAX30102_TAG, "Failed to create sensor during init");
        i2c_master_bus_rm_device(*dev_handle);
        *dev_handle = NULL;
        return ESP_ERR_NO_MEM;
    }

    ret = max30102_config(
        *sensor,
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
        ESP_LOGE(MAX30102_TAG, "Failed to config sensor during init: %s", esp_err_to_name(ret));
        goto cleanup;
    }

    ret = max30102_wakeup(*sensor);
    if (ret != ESP_OK) {
        ESP_LOGE(MAX30102_TAG, "Failed to wakeup sensor during init: %s", esp_err_to_name(ret));
        goto cleanup;
    }

    max30102_heartrate_algo_reset(*sensor);
    max30102_spo2_algo_reset(*sensor);
    return ESP_OK;

cleanup:
    max30102_delete(*sensor);
    *sensor = NULL;
    i2c_master_bus_rm_device(*dev_handle);
    *dev_handle = NULL;
    return ret;
}

void max30102_sensor_deinit(i2c_master_dev_handle_t dev_handle, max30102_handle_t sensor) {
    if (sensor) {
        esp_err_t ret = max30102_delete(sensor);
        if (ret != ESP_OK) {
            ESP_LOGE(MAX30102_TAG, "Failed to delete sensor during deinit: %s", esp_err_to_name(ret));
        }
    }
    if (dev_handle) {
        esp_err_t ret = i2c_master_bus_rm_device(dev_handle);
        if (ret != ESP_OK) {
            ESP_LOGE(MAX30102_TAG, "i2c_master failed to remove device during deinit: %s", esp_err_to_name(ret));
        }
    }
}

void max30102_heartrate_check_for_beat(max30102_handle_t sensor, int32_t sample, uint8_t* const beat_detected) {
    max30102_dev_t* const sens = sensor;

    *beat_detected = 0;

    sens->hr_algo.ir_ac_signal_prev = sens->hr_algo.ir_ac_signal_curr;

    sens->hr_algo.ir_avg_estimated = max30102_avg_dc_estimator(&sens->hr_algo.ir_avg_reg, (uint16_t)sample);
    sens->hr_algo.ir_ac_signal_curr = max30102_low_pass_fir_filter(
        sens->hr_algo.cbuf,
        &sens->hr_algo.offset,
        sens->hr_algo.fir_coeffs,
        (int16_t)(sample - sens->hr_algo.ir_avg_estimated)
    );

    if ((sens->hr_algo.ir_ac_signal_prev < 0) && 
        (sens->hr_algo.ir_ac_signal_curr >= 0)) {
        sens->hr_algo.ir_ac_max = sens->hr_algo.ir_ac_signal_max;
        sens->hr_algo.ir_ac_min = sens->hr_algo.ir_ac_signal_min;

        sens->hr_algo.positive_edge = 1;
        sens->hr_algo.negative_edge = 0;
        sens->hr_algo.ir_ac_signal_max = 0;

        if ((sens->hr_algo.ir_ac_max - sens->hr_algo.ir_ac_min) > 20 &&
            (sens->hr_algo.ir_ac_max - sens->hr_algo.ir_ac_min) < 1000) { 
            *beat_detected = 1;
        }
    }

    if ((sens->hr_algo.ir_ac_signal_prev > 0) &&
        (sens->hr_algo.ir_ac_signal_curr <= 0)) {
        sens->hr_algo.positive_edge = 0;
        sens->hr_algo.negative_edge = 1;
        sens->hr_algo.ir_ac_signal_min = 0;
    }

    if (sens->hr_algo.positive_edge &&
        (sens->hr_algo.ir_ac_signal_curr > sens->hr_algo.ir_ac_signal_prev)) {
        sens->hr_algo.ir_ac_signal_max = sens->hr_algo.ir_ac_signal_curr;
    }

    if (sens->hr_algo.negative_edge &&
        (sens->hr_algo.ir_ac_signal_curr < sens->hr_algo.ir_ac_signal_prev)) { 
        sens->hr_algo.ir_ac_signal_min = sens->hr_algo.ir_ac_signal_curr;
    }
}

void max30102_heartrate_and_spo2(max30102_handle_t sensor, uint32_t* const pun_ir_buffer, int32_t n_ir_buffer_length,
                                 uint32_t* const pun_red_buffer, int32_t* const pn_spo2, int8_t* const pch_spo2_valid,
                                 int32_t* const pn_heart_rate, int8_t* const pch_hr_valid) {
    max30102_dev_t* const sens = sensor;

    uint32_t un_ir_mean;
    int32_t k, n_i_ratio_count, 
            i, n_exact_ir_valley_locs_count, n_middle_idx,
            n_th1, n_npks,
            n_peak_interval_sum,
            n_y_ac, n_x_ac,
            n_spo2_calc,
            n_y_dc_max, n_x_dc_max,
            n_nume, n_denom,
            n_ratio_average;
    int32_t n_y_dc_max_idx = 0, n_x_dc_max_idx = 0;
    int32_t an_ir_valley_locs[15], an_ratio[5];

    un_ir_mean = 0;

    for (k = 0; k < n_ir_buffer_length; ++k) {
        un_ir_mean += pun_ir_buffer[k];
    }

    un_ir_mean = un_ir_mean / n_ir_buffer_length;

    for (k = 0; k < n_ir_buffer_length; ++k) {
        sens->spo2_algo.an_x[k] = -1 * ((int32_t) (pun_ir_buffer[k] - un_ir_mean));
    }

    for (k = 0; k < CARDIAC_BUFFER_SIZE - CARDIAC_MA4_SIZE; ++k) {
        sens->spo2_algo.an_x[k] = (sens->spo2_algo.an_x[k] +
                                   sens->spo2_algo.an_x[k + 1] +
                                   sens->spo2_algo.an_x[k + 2] +
                                   sens->spo2_algo.an_x[k + 3]) / (int)4;
    }

    n_th1 = 0;

    for (k = 0; k < CARDIAC_BUFFER_SIZE; ++k) {
        n_th1 += sens->spo2_algo.an_x[k];
    }

    n_th1 = n_th1 / (CARDIAC_BUFFER_SIZE);

    if (n_th1 < 30) {
        n_th1 = 30;
    }

    if (n_th1 > 60) {
        n_th1 = 60;
    }

    for (k = 0; k < 15; ++k) {
        an_ir_valley_locs[k] = 0;
    }

    max30102_find_peaks(an_ir_valley_locs,
                        &n_npks,
                        sens->spo2_algo.an_x,
                        CARDIAC_BUFFER_SIZE,
                        n_th1,
                        4,
                        15);

    n_peak_interval_sum = 0;
    if (n_npks >= 2) {
        for (k = 1; k < n_npks; ++k) {
            n_peak_interval_sum += (an_ir_valley_locs[k] - an_ir_valley_locs[k - 1]);
        }

        n_peak_interval_sum = n_peak_interval_sum / (n_npks - 1);
        *pn_heart_rate = (int32_t) ((CARDIAC_FREQS * 60) / n_peak_interval_sum);
        *pch_hr_valid = 1;
    } else {
        *pn_heart_rate = -999;
        *pch_hr_valid = 0;
    }

    for (k = 0; k < n_ir_buffer_length; ++k) {
        sens->spo2_algo.an_x[k] = pun_ir_buffer[k];
        sens->spo2_algo.an_y[k] = pun_red_buffer[k];
    }

    n_exact_ir_valley_locs_count = n_npks;

    n_ratio_average = 0;
    n_i_ratio_count = 0;

    for (k = 0; k < 5; ++k) {
        an_ratio[k] = 0;
    }

    for (k = 0; k < n_exact_ir_valley_locs_count; ++k) {
        if (an_ir_valley_locs[k] > CARDIAC_BUFFER_SIZE) {
            *pn_spo2 = -999;
            *pch_spo2_valid = 0;
            return;
        }
    }

    for (k = 0; k < n_exact_ir_valley_locs_count - 1; ++k) {
        n_y_dc_max = -16777216;
        n_x_dc_max = -16777216;

        if (an_ir_valley_locs[k + 1] - an_ir_valley_locs[k] > 3) {
            for (i = an_ir_valley_locs[k]; i < an_ir_valley_locs[k + 1]; ++i) {
                if (sens->spo2_algo.an_x[i] > n_x_dc_max) {
                    n_x_dc_max = sens->spo2_algo.an_x[i];
                    n_x_dc_max_idx = i;
                }

                if (sens->spo2_algo.an_y[i] > n_y_dc_max) {
                    n_y_dc_max = sens->spo2_algo.an_y[i];
                    n_y_dc_max_idx = i;
                }
            }

            n_y_ac = (sens->spo2_algo.an_y[an_ir_valley_locs[k + 1]] -
                     sens->spo2_algo.an_y[an_ir_valley_locs[k]]) *
                     (n_y_dc_max_idx - an_ir_valley_locs[k]);
            n_y_ac = sens->spo2_algo.an_y[an_ir_valley_locs[k]] +
                     n_y_ac /
                     (an_ir_valley_locs[k + 1] - an_ir_valley_locs[k]);
            n_y_ac = sens->spo2_algo.an_y[n_y_dc_max_idx] - n_y_ac;

            n_x_ac = (sens->spo2_algo.an_x[an_ir_valley_locs[k + 1]] -
                     sens->spo2_algo.an_x[an_ir_valley_locs[k]]) *
                     (n_x_dc_max_idx - an_ir_valley_locs[k]);
            n_x_ac = sens->spo2_algo.an_x[an_ir_valley_locs[k]] +
                     n_x_ac /
                     (an_ir_valley_locs[k + 1] - an_ir_valley_locs[k]);
            n_x_ac = sens->spo2_algo.an_x[n_y_dc_max_idx] - n_x_ac;

            n_nume = (n_y_ac * n_x_dc_max) >> 7;
            n_denom = (n_x_ac * n_y_dc_max) >> 7;

            if (n_denom > 0 && n_i_ratio_count < 5 && n_nume != 0) {
                an_ratio[n_i_ratio_count] = (n_nume * 100) / n_denom;
                ++n_i_ratio_count;
            }
        }
    }

    max30102_sort_ascend(an_ratio, n_i_ratio_count);
    n_middle_idx = n_i_ratio_count / 2;

    if (n_middle_idx > 1) {
        n_ratio_average = (an_ratio[n_middle_idx - 1] + an_ratio[n_middle_idx]) / 2;
    } else {
        n_ratio_average = an_ratio[n_middle_idx];
    }

    if (n_ratio_average > 2 && n_ratio_average < 184) {
        n_spo2_calc = sens->spo2_algo.uch_spo2_table[n_ratio_average];
        *pn_spo2 = n_spo2_calc;
        *pch_spo2_valid = 1;
    } else {
        *pn_spo2 = -999;
        *pch_spo2_valid = 0;
    }
}

void max30102_set_stats_for_display(int beat_avg, int32_t spo2) {
    s_stats.beat_avg = beat_avg;
    s_stats.spo2 = spo2;
}

void max30102_get_beat_avg(int* const beat_avg) {
    *beat_avg = s_stats.beat_avg;
}

void max30102_get_spo2(int* const spo2) {
    *spo2 = (int) s_stats.spo2;
}

void max30102_set_stats_for_task(int hr_low, int hr_high, int spo2_low) {
    s_stats.hr_low = hr_low;
    s_stats.hr_high = hr_high;
    s_stats.spo2_low = spo2_low;
}

void max30102_monitor_reset(max30102_monitor_t* const monitor) {
    monitor->warmup_start_us = esp_timer_get_time();
    monitor->stable_count = 0;
    monitor->event_count = 0;
    monitor->last_flags = CARDIAC_EVENT_NONE;
}

void max30102_process_cardiac_sample(int beat_avg, int spo2,
                                     max30102_monitor_t* const monitor,
                                     max30102_event_flags_t* const event) {
    int64_t elapsed_ms = (esp_timer_get_time() - monitor->warmup_start_us) / 1000;

    if (elapsed_ms < CARDIAC_SENSOR_WARMUP_MS) {
        *event = CARDIAC_EVENT_NONE;
    }

    uint8_t hr_valid = (beat_avg > 0);
    uint8_t spo2_valid = (spo2 > -999);

    if (!hr_valid && !spo2_valid) {
        monitor->stable_count = 0;
        *event = CARDIAC_EVENT_NONE;
    }
    ++monitor->stable_count;
    if (monitor->stable_count < CARDIAC_REQUIRED_STABLE_SAMPLES) {
        *event = CARDIAC_EVENT_NONE;
    }

    max30102_event_flags_t flags = CARDIAC_EVENT_NONE;
    
    if (hr_valid && beat_avg < s_stats.hr_low) {
        flags = CARDIAC_EVENT_HR_LOW;
    }
    if (hr_valid && beat_avg > s_stats.hr_high) {
        flags = CARDIAC_EVENT_HR_HIGH;
    }
    if (spo2_valid && spo2 < s_stats.spo2_low) {
        flags = CARDIAC_EVENT_SPO2_LOW;
    }

    if (flags != CARDIAC_EVENT_NONE && flags == monitor->last_flags) {
        ++monitor->event_count;
    } else {
        monitor->event_count = (flags != CARDIAC_EVENT_NONE) ? 1 : 0;
    }
    monitor->last_flags = flags;

    if (flags != CARDIAC_EVENT_NONE && monitor->event_count >= CARDIAC_REQUIRED_EVENT_SAMPLES) {
        monitor->event_count = 0;
        *event = flags;
    }

    *event = CARDIAC_EVENT_NONE;
}
