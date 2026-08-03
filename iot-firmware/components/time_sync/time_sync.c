#include <sys/time.h>
#include <time.h>

#include "esp_sntp.h"
#include "esp_log.h"

#include "time_sync.h"

esp_err_t time_sync_init() {
    setenv("TZ", "ICT-7", 1);
    tzset();

    esp_sntp_setoperatingmode(SNTP_OPMODE_POLL);

    esp_sntp_setservername(0, "pool.ntp.org");
    esp_sntp_setservername(1, "time.google.com");

    esp_sntp_init();

    time_t now = 0;
    struct tm timeinfo = {0};

    int retry = 0;
    const int retry_limit = 20;

    while (timeinfo.tm_year < (2020 - 1900) &&
           retry < retry_limit) {
        ESP_LOGI("TIME_SYNC",
                 "Waiting for system time... (%d/%d)",
                 retry + 1,
                 retry_limit);

        vTaskDelay(pdMS_TO_TICKS(1000));

        time(&now);
        gmtime_r(&now, &timeinfo);

        retry++;
    }


    if (timeinfo.tm_year < (2020 - 1900)) {
        return ESP_FAIL;
    }

    return ESP_OK;
}

void get_iso8601_now(char* buf, size_t buf_size) {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    struct tm timeinfo;
    localtime_r(&tv.tv_sec, &timeinfo);
    snprintf(buf, buf_size, "%04d-%02d-%02dT%02d:%02d:%02d.%06ldZ",
             timeinfo.tm_year + 1900, timeinfo.tm_mon + 1, timeinfo.tm_mday,
             timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec, tv.tv_usec);
}