#ifndef MAX30102_H
#define MAX30102_H

#include <stdint.h>
#include <stdbool.h>

#include "driver/i2c_types.h"
#include "esp_err.h"

#ifdef __cplusplus 
extern "C" {
#endif

typedef enum {
    SAMPLEAVG_1     = 0x00,
    SAMPLEAVG_2     = 0x20,
    SAMPLEAVG_4     = 0x40,
    SAMPLEAVG_8     = 0x60,
    SAMPLEAVG_16    = 0x80,
    SAMPLEAVG_32    = 0xA0,
} max30102_smp_avg_t;

typedef enum {
    FIFO_A_FULL_0   = 0,
    FIFO_A_FULL_1   = 1,
    FIFO_A_FULL_2   = 2,
    FIFO_A_FULL_3   = 3,
    FIFO_A_FULL_4   = 4,
    FIFO_A_FULL_5   = 5,
    FIFO_A_FULL_6   = 6,
    FIFO_A_FULL_7   = 7,
    FIFO_A_FULL_8   = 8,
    FIFO_A_FULL_9   = 9,
    FIFO_A_FULL_10  = 10,
    FIFO_A_FULL_11  = 11,
    FIFO_A_FULL_12  = 12,
    FIFO_A_FULL_13  = 13,
    FIFO_A_FULL_14  = 14,
    FIFO_A_FULL_15  = 15,
} max30102_fifo_a_full_t;

typedef enum {
    REDONLY_MODE    = 2,
    REDIRONLY_MODE  = 3,
    MULTILED_MODE   = 7,
} max30102_mode_t;

typedef enum {
    ADCRANGE_2048   = 0x00,
    ADCRANGE_4096   = 0x20,
    ADCRANGE_8192   = 0x40,
    ADCRANGE_16384  = 0x60,
} max30102_adc_rng_t;

typedef enum {
    SAMPLERATE_50   = 0x00,
    SAMPLERATE_100  = 0x04,
    SAMPLERATE_200  = 0x08,
    SAMPLERATE_400  = 0x0C,
    SAMPLERATE_800  = 0x10,
    SAMPLERATE_1000 = 0x14,
    SAMPLERATE_1600 = 0x18,
    SAMPLERATE_3200 = 0x1C,
} max30102_smp_rate_t;

typedef enum {
    PULSEWIDTH_69US     = 0,
    PULSEWIDTH_118US    = 1,
    PULSEWIDTH_215US    = 2,
    PULSEWIDTH_411US    = 3,
} max30102_led_pw_t;

typedef enum {
    PULSEAMP_0_0MA  = 0,
    PULSEAMP_0_2MA  = 1,
    PULSEAMP_0_4MA  = 2,
    PULSEAMP_3_1MA  = 15,
    PULSEAMP_6_4MA  = 31,
    PULSEAMP_12_5MA = 63,
    PULSEAMP_25_4MA = 127,
    PULSEAMP_50MA   = 255,
} max30102_led_pa_t;


typedef void* max30102_handle_t; 


max30102_handle_t max30102_create(i2c_master_dev_handle_t dev);
void max30102_delete(max30102_handle_t);
esp_err_t max30102_wakeup(max30102_handle_t sensor);
esp_err_t max30102_shutdown(max30102_handle_t sensor);
esp_err_t max30102_config(max30102_handle_t sensor, max30102_mode_t mode, max30102_smp_avg_t sample_average,
                          uint8_t rollover_en, max30102_fifo_a_full_t fifo_a_full, max30102_adc_rng_t adc_range,
                          max30102_smp_rate_t sample_rate, max30102_led_pw_t pulse_width, max30102_led_pa_t pulse_amplitute);
esp_err_t max30102_clear_fifo(max30102_handle_t sensor);
esp_err_t max30102_read_fifo(max30102_handle_t sensor, uint32_t* red, uint32_t* ir);
void max30102_heartrate_algo_reset(max30102_handle_t sensor);
void max30102_spo2_algo_reset(max30102_handle_t sensor);
bool max30102_heartrate_check_for_beat(max30102_handle_t sensor, int32_t sample);
void max30102_heartrate_and_spo2(max30102_handle_t sensor, uint32_t* pun_ir_buffer, int32_t n_ir_buffer_length,
                                 uint32_t* pun_red_buffer, int32_t* pn_spo2, int8_t* pch_spo2_valid,
                                 int32_t* pn_heart_rate, int8_t* pch_hr_valid);
void max30102_set_beat_avg(const int beat_avg);
int max30102_get_beat_avg();
void max30102_set_spo2(const int32_t spo2);
int32_t max30102_get_spo2();
void max30102_set_hr_low(const int hr_low);
int max30102_get_hr_low();
void max30102_set_hr_high(const int hr_high);
int max30102_get_hr_high();
void max30102_set_spo2_low(const int spo2_low);
int max30102_get_spo2_low();

#ifdef __cplusplus
}
#endif

#endif