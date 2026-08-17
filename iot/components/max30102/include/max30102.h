#ifndef MAX30102_H
#define MAX30102_H

#include "driver/i2c_types.h"
#include "esp_err.h"

#ifdef __cplusplus 
extern "C" {
#endif

#define CARDIAC_BUFFER_SIZE         50
#define CARDIAC_FINGER_THRESHOLD    50000
#define CARDIAC_FREQS               12.5
#define CARDIAC_MA4_SIZE            4
#define CARDIAC_RATE_AVG_SIZE       4
#define CARDIAC_SAMPLE_RATE_HZ      50
#define CARDIAC_SENSOR_WARMUP_MS    3000

#define CARDIAC_PUBLISH_EVERY_N_SAMPLES (CARDIAC_SAMPLE_RATE_HZ > 0 ? CARDIAC_SAMPLE_RATE_HZ : 1)
#define CARDIAC_SPO2_DECIMATION         (CARDIAC_SAMPLE_RATE_HZ / CARDIAC_FREQS)

#define MAX30102_TAG            "MAX30102"

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

typedef enum {
    CARDIAC_EVENT_NONE     = 0,
    CARDIAC_EVENT_HR_LOW   = 1,
    CARDIAC_EVENT_HR_HIGH  = 2,
    CARDIAC_EVENT_SPO2_LOW = 3,
} max30102_event_flags_t;

typedef struct {
    int64_t warmup_start_us;
    int stable_count;
    int event_count;
    max30102_event_flags_t last_flags;
} max30102_monitor_t;

typedef void* max30102_handle_t; 


esp_err_t   max30102_sensor_init(i2c_master_bus_handle_t bus_handle,
                                 i2c_master_dev_handle_t* const dev_handle,
                                 max30102_handle_t* const sensor);
void        max30102_sensor_deinit(i2c_master_dev_handle_t dev_handle, max30102_handle_t sensor);
esp_err_t   max30102_clear_fifo(max30102_handle_t sensor);
esp_err_t   max30102_read_fifo(max30102_handle_t sensor, uint32_t* const red, uint32_t* const ir);

void        max30102_heartrate_algo_reset(max30102_handle_t sensor);
void        max30102_spo2_algo_reset(max30102_handle_t sensor);
void        max30102_heartrate_check_for_beat(max30102_handle_t sensor, int32_t sample, uint8_t* const beat_detected);
void        max30102_heartrate_and_spo2(max30102_handle_t sensor, uint32_t* const pun_ir_buffer, int32_t n_ir_buffer_length,
                                        uint32_t* const pun_red_buffer, int32_t* const pn_spo2, int8_t* const pch_spo2_valid,
                                        int32_t* const pn_heart_rate, int8_t* const pch_hr_valid);

void    max30102_set_stats_for_display(int beat_avg, int32_t spo2);
void    max30102_get_beat_avg(int* const beat_avg);
void    max30102_get_spo2(int* const spo2);
void    max30102_set_stats_for_task(int hr_low, int hr_high, int spo2_low);

void    max30102_monitor_reset(max30102_monitor_t* monitor);
void    max30102_process_cardiac_sample(int beat_avg, int spo2,
                                        max30102_monitor_t* const monitor,
                                        max30102_event_flags_t* const event);

#ifdef __cplusplus
}
#endif

#endif