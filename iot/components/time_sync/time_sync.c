#include <sys/time.h>

#include "esp_err.h"
#include "freertos/FreeRTOS.h"
#include "freertos/projdefs.h"
#include "freertos/semphr.h"
#include "esp_sntp.h"
#include "esp_log.h"

#include "time_sync.h"

#define TIME_SYNC_TAG           "TIME_SYNC"
#define TIME_SYNC_TIMEOUT_MS    (20 * 1000)

static SemaphoreHandle_t s_time_sync_sem = NULL;

static void time_sync_notification_cb(struct timeval* tv) {
    if (s_time_sync_sem != NULL) {
        xSemaphoreGive(s_time_sync_sem);
    }
}

esp_err_t time_sync_init(void) {
    if (s_time_sync_sem != NULL) {
        ESP_LOGW(TIME_SYNC_TAG, "time_sync_init called more than once");
        return ESP_ERR_INVALID_STATE;
    }

    s_time_sync_sem = xSemaphoreCreateBinary();
    if (NULL == s_time_sync_sem) {
        ESP_LOGE(TIME_SYNC_TAG, "Failed to create sync semaphore");
        return ESP_ERR_NO_MEM;
    }

    esp_sntp_setoperatingmode(SNTP_OPMODE_POLL);
    esp_sntp_setservername(0, "pool.ntp.org");
    esp_sntp_setservername(1, "time.google.com");
    sntp_set_time_sync_notification_cb(time_sync_notification_cb);

    esp_sntp_init();

    ESP_LOGI(TIME_SYNC_TAG, "Waiting for SNTP time sync");

    esp_err_t ret = ESP_OK;
    if (pdTRUE != xSemaphoreTake(s_time_sync_sem, pdMS_TO_TICKS(TIME_SYNC_TIMEOUT_MS))) {
        ESP_LOGE(TIME_SYNC_TAG, "Time sync timed out after %d ms", TIME_SYNC_TIMEOUT_MS);
        ret = ESP_ERR_TIMEOUT;
    } else {
        ESP_LOGI(TIME_SYNC_TAG, "Time synced successfully");
    }
    
    vSemaphoreDelete(s_time_sync_sem);
    s_time_sync_sem = NULL;

    return ret;
}

int64_t get_epoch_ms_now(void) {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    return (int64_t) tv.tv_sec * 1000 + tv.tv_usec / 1000;
}
